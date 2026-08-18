import { webhookService } from "./src/services/discord";
import type { Incident, Construction, DangerousSlowDown } from "./src/types/ohgo_types";

async function testWebhooks() {
    console.log("Testing Incidents Webhook...");
    const dummyIncident = {
        id: "TEST-1",
        routeName: "I-71",
        description: "Test Incident: Multi-vehicle collision, expect delays.",
        location: "Columbus",
        direction: "Northbound",
        category: "Accident",
        latitude: 39.96,
        longitude: -83.00,
        links: []
    } as unknown as Incident;
    await webhookService.notifyNewIncident(dummyIncident);
    console.log("✅ Incident webhook fired!");

    console.log("Testing Construction Webhook...");
    const dummyConstruction = {
        id: "TEST-2",
        routeName: "I-70",
        description: "Test Construction: Right lane closed for paving.",
        location: "Columbus",
        direction: "Eastbound",
        latitude: 39.96,
        longitude: -83.00,
        links: []
    } as unknown as Construction;
    await webhookService.notifyNewConstruction(dummyConstruction);
    console.log("✅ Construction webhook fired!");

    console.log("Testing Slowdown Webhook...");
    const dummySlowdown = {
        id: "TEST-3",
        routeName: "I-270",
        description: "Test Slowdown: Traffic is moving at 15mph.",
        location: "Columbus",
        direction: "Westbound",
        latitude: 39.96,
        longitude: -83.00,
        links: []
    } as unknown as DangerousSlowDown;
    await webhookService.notifyNewSlowdown(dummySlowdown);
    console.log("✅ Slowdown webhook fired!");
}

testWebhooks().catch(console.error);
