export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyAdminStatusChanged, notifyCustomerStatusChanged } from '@/lib/notifications';
import { z } from 'zod';

const adminUpdateSchema = z.object({
  status: z
    .enum([
      'REQUESTED',
      'CONFIRMED',
      'IN_PROGRESS',
      'WAITING_CUSTOMER',
      'COMPLETED',
      'PAID',
      'CANCELLED',
    ])
    .optional(),
  estimatedCost: z.number().min(0).optional(),
  finalCost: z.number().min(0).optional(),
  adminNotes: z.string().nullable().optional(),
  technicianNotes: z.string().nullable().optional(),
  technicianId: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  paymentMethod: z.string().max(40).optional(),
});

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['CONFIRMED', 'IN_PROGRESS', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'WAITING_CUSTOMER', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_CUSTOMER', 'COMPLETED', 'CANCELLED'],
  WAITING_CUSTOMER: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: ['PAID', 'IN_PROGRESS', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }

    const ticket = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
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
      },
    });
    if (!ticket) return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = adminUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      status,
      estimatedCost,
      finalCost,
      adminNotes,
      technicianNotes,
      technicianId,
      note,
      paymentMethod,
    } = parsed.data;

    const oldStatus = ticket.status;

    if (status !== undefined && status !== oldStatus) {
      const allowed = ALLOWED_TRANSITIONS[oldStatus] ?? [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `Transisi status tidak valid: ${oldStatus} -> ${status}.`,
          },
          { status: 400 }
        );
      }
    }

    const data: Prisma.ServiceRequestUncheckedUpdateInput = {};
    if (status !== undefined) data.status = status;
    if (estimatedCost !== undefined) data.estimatedCost = estimatedCost;
    if (finalCost !== undefined) data.finalCost = finalCost;
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (technicianNotes !== undefined) data.technicianNotes = technicianNotes;

    if (technicianId !== undefined) {
      if (technicianId === null || technicianId === '') {
        data.technicianId = null;
      } else {
        const tech = await prisma.technician.findUnique({ where: { id: technicianId } });
        if (!tech) return NextResponse.json({ error: 'Teknisi tidak ditemukan' }, { status: 400 });
        if (!tech.isActive) return NextResponse.json({ error: 'Teknisi tidak aktif' }, { status: 400 });
        data.technicianId = technicianId;
      }
    }

    const paymentAmount =
      (finalCost !== undefined ? finalCost : ticket.finalCost) ||
      ticket.estimatedCost ||
      0;

    if (status === 'PAID' && oldStatus !== 'PAID' && paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal pembayaran belum ditetapkan. Isi biaya final terlebih dahulu.' },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.serviceRequest.update({
        where: { id: params.id },
        data,
        include: { technician: true },
      });

      if (status !== undefined && status !== oldStatus) {
        await tx.serviceRequestStatusHistory.create({
          data: {
            serviceRequestId: params.id,
            oldStatus,
            newStatus: status,
            changedBy: user.id,
            note: note ?? null,
          },
        });
      }

      if (status === 'PAID' && oldStatus !== 'PAID') {
        const existingPaid = await tx.payment.findFirst({
          where: { serviceRequestId: params.id, status: 'PAID' },
        });

        if (!existingPaid) {
          const pending = await tx.payment.findFirst({
            where: {
              serviceRequestId: params.id,
              status: { in: ['PENDING', 'UNPAID', 'PARTIAL'] },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (pending) {
            await tx.payment.update({
              where: { id: pending.id },
              data: {
                amount: paymentAmount,
                status: 'PAID',
                paymentMethod: paymentMethod ?? pending.paymentMethod,
                paidAt: new Date(),
              },
            });
          } else {
            await tx.payment.create({
              data: {
                serviceRequestId: params.id,
                amount: paymentAmount,
                status: 'PAID',
                paymentMethod: paymentMethod ?? 'CASH',
                paidAt: new Date(),
              },
            });
          }
        }
      }

      return result;
    });

    if (status !== undefined && status !== oldStatus) {
      await notifyAdminStatusChanged(updated, ticket.customer, oldStatus, status, note);
      await notifyCustomerStatusChanged(updated, ticket.customer, oldStatus, status, note);
    }

    return NextResponse.json({ message: 'Tiket diperbarui', ticket: updated });
  } catch (e) {
    console.error('Update service request error:', e);
    return NextResponse.json({ error: 'Gagal memperbarui tiket' }, { status: 500 });
  }
}
