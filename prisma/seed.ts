import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const facility = await prisma.facility.create({
    data: {
      name: "Apex Components Plant",
      location: "Columbus, OH",
      lines: {
        create: [
          { name: "Line A - Precision", throughputPerHour: 42 },
          { name: "Line B - Assembly", throughputPerHour: 58 },
          { name: "Line C - Finishing", throughputPerHour: 35 }
        ]
      }
    }
  });

  const product = await prisma.product.create({
    data: { name: "Valve Housing", family: "Hydraulics", leadTimeDays: 6 }
  });

  const line = await prisma.productionLine.findFirst({ where: { facilityId: facility.id } });
  if (!line) return;

  await prisma.workOrder.create({
    data: {
      id: "WO-10021",
      quantity: 480,
      dueDate: new Date("2026-03-20"),
      priority: "high",
      status: "in-progress",
      lineId: line.id,
      productId: product.id,
      operations: {
        create: [
          { name: "Rough CNC", durationHours: 12, setupHours: 1.5 },
          { name: "Finish CNC", durationHours: 8, setupHours: 1.0 }
        ]
      }
    }
  });

  await prisma.resource.createMany({
    data: [
      { name: "CNC Cell 22", type: "machine", utilization: 0.82, status: "available" },
      { name: "Laser Cell 7", type: "machine", utilization: 0.66, status: "constrained" }
    ]
  });

  await prisma.alert.create({
    data: {
      type: "material",
      title: "Material shortage risk",
      description: "Control Boards inventory below safety stock for WO-10045.",
      severity: "high"
    }
  });

  await prisma.scenario.create({
    data: {
      name: "Base Plan",
      summary: "Current schedule with maintenance constraints and material risk.",
      metrics: {
        create: [
          { label: "OEE", value: 78, unit: "%", delta: -2 },
          { label: "OTIF", value: 88, unit: "%", delta: -4 }
        ]
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
