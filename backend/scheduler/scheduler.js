const cron = require('node-cron');
const ticket = require('../models/SupportTicket');
const Managerticket = require('../models/manager_ticket');

function startTicketEscalationJob() {
  cron.schedule('0 */1 * * *', async () => {
    console.log("######################  Running ticket check...");

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    try {
      const ticketsToEscalate = await ticket.find({
        status: { $ne: 'resolved' },
        createdAt: { $lte: fortyEightHoursAgo },
        escalatedToManager: { $ne: true }
      });

      for (const t of ticketsToEscalate) {
        // Convert Mongoose document to plain object and remove _id and __v
        const ticketData = t.toObject();
        delete ticketData._id;
        delete ticketData.__v;

        // Create a new manager ticket
        await Managerticket.create(ticketData);

        // Mark original ticket as escalated (avoid version error by using update)
        await ticket.findByIdAndUpdate(t._id, { $set: { escalatedToManager: true } });

        console.log(`Escalated Ticket ID: ${t._id}`);
      }

      console.log(`Escalated ${ticketsToEscalate.length} tickets.`);
    } catch (err) {
      console.error("Error during escalation:", err);
    }
  });
}

startTicketEscalationJob();
module.exports = startTicketEscalationJob;
