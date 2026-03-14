/* eslint-disable no-console */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const facilityId = randomUUID();
const lineAId = randomUUID();
const lineBId = randomUUID();
const machineIds = [randomUUID(), randomUUID(), randomUUID()];
const workerIds = [randomUUID(), randomUUID()];
const productIds = [randomUUID(), randomUUID()];
const workOrderIds = [randomUUID(), randomUUID()];
const taskIds = [randomUUID(), randomUUID(), randomUUID()];
const scenarioIds = [randomUUID(), randomUUID()];
const metricIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const alertIds = [randomUUID(), randomUUID()];

async function seedAuth() {
  const email = "planner@smartsched.ai";
  const password = "demo1234";

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error && !error.message.includes("already registered")) {
    throw error;
  }

  console.log(`Auth user ready: ${email}`, data?.user?.id ?? "(existing)");
}

async function seedCore() {
  const facilities = [
    {
      id: facilityId,
      code: "F-ATL",
      name: "Atlanta Assembly",
      timezone: "America/New_York",
    },
  ];

  const productionLines = [
    { id: lineAId, facility_id: facilityId, code: "LN-PAINT", name: "Paint & Prep" },
    { id: lineBId, facility_id: facilityId, code: "LN-FINAL", name: "Final Assembly" },
  ];

  const machines = [
    { id: machineIds[0], production_line_id: lineAId, code: "MC-01", name: "Paint Booth A", type: "coating", status: "idle" },
    { id: machineIds[1], production_line_id: lineAId, code: "MC-02", name: "Drying Oven", type: "oven", status: "running" },
    { id: machineIds[2], production_line_id: lineBId, code: "MC-10", name: "Torque Station", type: "assembly", status: "idle" },
  ];

  const workers = [
    { id: workerIds[0], facility_id: facilityId, production_line_id: lineAId, name: "Alex Rivera", role: "Supervisor", skill_level: 5, status: "active" },
    { id: workerIds[1], facility_id: facilityId, production_line_id: lineBId, name: "Priya Desai", role: "Assembler", skill_level: 4, status: "active" },
  ];

  const products = [
    { id: productIds[0], sku: "PRD-1001", name: "Industrial Pump", description: "High-pressure pump" },
    { id: productIds[1], sku: "PRD-2004", name: "Valve Assembly", description: "Precision valve" },
  ];

  const workOrders = [
    {
      id: workOrderIds[0],
      code: "WO-2451",
      product_id: productIds[0],
      facility_id: facilityId,
      assigned_line_id: lineAId,
      quantity: 120,
      priority: 2,
      due_date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      progress: 35,
      status: "in_progress",
    },
    {
      id: workOrderIds[1],
      code: "WO-2452",
      product_id: productIds[1],
      facility_id: facilityId,
      assigned_line_id: lineBId,
      quantity: 80,
      priority: 1,
      due_date: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
      progress: 10,
      status: "planned",
    },
  ];

  const tasks = [
    {
      id: taskIds[0],
      work_order_id: workOrderIds[0],
      production_line_id: lineAId,
      machine_id: machineIds[0],
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      status: "in_progress",
    },
    {
      id: taskIds[1],
      work_order_id: workOrderIds[0],
      production_line_id: lineAId,
      machine_id: machineIds[1],
      start_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
      end_time: null,
      status: "scheduled",
    },
    {
      id: taskIds[2],
      work_order_id: workOrderIds[1],
      production_line_id: lineBId,
      machine_id: machineIds[2],
      start_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      end_time: null,
      status: "scheduled",
    },
  ];

  const alerts = [
    {
      id: alertIds[0],
      type: "machine_downtime",
      severity: "critical",
      message: "Paint Booth A faulted, waiting on maintenance.",
      status: "open",
      related_work_order_id: workOrderIds[0],
      related_line_id: lineAId,
    },
    {
      id: alertIds[1],
      type: "delay",
      severity: "warning",
      message: "Valve Assembly awaiting parts ETA 12 hours.",
      status: "open",
      related_work_order_id: workOrderIds[1],
      related_line_id: lineBId,
    },
  ];

  const scenarios = [
    { id: scenarioIds[0], name: "Base Plan", oee: 71.4, otif: 88.0, utilization: 67.5, setup_reduction: 0, summary: "Current baseline schedule" },
    { id: scenarioIds[1], name: "AI Optimized", oee: 79.2, otif: 94.0, utilization: 74.1, setup_reduction: 12.5, summary: "Reduced changeovers and leveled load" },
  ];

  const metrics = [
    { id: metricIds[0], scenario_id: scenarioIds[0], facility_id: facilityId, production_line_id: lineAId, oee: 70, otif: 86, utilization: 65, throughput: 95, wip: 180, notes: "Baseline paint line" },
    { id: metricIds[1], scenario_id: scenarioIds[0], facility_id: facilityId, production_line_id: lineBId, oee: 73, otif: 90, utilization: 69, throughput: 88, wip: 140, notes: "Baseline assembly" },
    { id: metricIds[2], scenario_id: scenarioIds[1], facility_id: facilityId, production_line_id: lineAId, oee: 78, otif: 95, utilization: 72, throughput: 110, wip: 120, notes: "Optimized paint line" },
    { id: metricIds[3], scenario_id: scenarioIds[1], facility_id: facilityId, production_line_id: lineBId, oee: 80, otif: 96, utilization: 76, throughput: 102, wip: 115, notes: "Optimized assembly" },
  ];

  await supabase.from("facilities").upsert(facilities, { onConflict: "id" });
  await supabase.from("production_lines").upsert(productionLines, { onConflict: "id" });
  await supabase.from("machines").upsert(machines, { onConflict: "id" });
  await supabase.from("workers").upsert(workers, { onConflict: "id" });
  await supabase.from("products").upsert(products, { onConflict: "id" });
  await supabase.from("work_orders").upsert(workOrders, { onConflict: "id" });
  await supabase.from("scheduled_tasks").upsert(tasks, { onConflict: "id" });
  await supabase.from("alerts").upsert(alerts, { onConflict: "id" });
  await supabase.from("scenarios").upsert(scenarios, { onConflict: "id" });
  await supabase.from("metric_snapshots").upsert(metrics, { onConflict: "id" });

  console.log("Seed data inserted");
}

async function main() {
  await seedAuth();
  await seedCore();
  console.log("Done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
