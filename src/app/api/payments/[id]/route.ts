import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyAdminPaymentPaid, notifyCustomerPaymentVerified } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat memverifikasi pembayaran.' },
        { status: 403 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        serviceRequest: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                telegramChatId: true,
              },
            },
            service: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 });
    }

    if (payment.status === 'PAID') {
      return NextResponse.json({ error: 'Pembayaran sudah diverifikasi' }, { status: 400 });
    }

    if (!['COMPLETED', 'PAID'].includes(payment.serviceRequest.status)) {
      return NextResponse.json(
        { error: 'Pembayaran hanya dapat diverifikasi untuk tiket berstatus Selesai.' },
        { status: 400 }
      );
    }

    const paidAt = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt },
      });

      let updatedTicket = payment.serviceRequest;
      if (payment.serviceRequest.status !== 'PAID') {
        updatedTicket = await tx.serviceRequest.update({
          where: { id: payment.serviceRequestId },
          data: { status: 'PAID' },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                telegramChatId: true,
              },
            },
            service: true,
          },
        });

        await tx.serviceRequestStatusHistory.create({
          data: {
            serviceRequestId: payment.serviceRequestId,
            oldStatus: payment.serviceRequest.status,
            newStatus: 'PAID',
            changedBy: user.id,
            note: `Pembayaran sebesar Rp${payment.amount.toLocaleString('id-ID')} diverifikasi Admin via ${payment.paymentMethod}.`,
          },
        });
      }

      return { payment: updatedPayment, ticket: updatedTicket };
    });

    await notifyAdminPaymentPaid(
      result.payment,
      result.ticket,
      payment.serviceRequest.customer
    );
    await notifyCustomerPaymentVerified(
      result.payment,
      result.ticket,
      payment.serviceRequest.customer
    );

    return NextResponse.json({
      message: 'Pembayaran berhasil diverifikasi dan tiket ditandai lunas',
      payment: result.payment,
      ticket: result.ticket,
    });
  } catch (e) {
    console.error('Verify payment error:', e);
    return NextResponse.json({ error: 'Gagal memverifikasi pembayaran' }, { status: 500 });
  }
}
