import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: Number,
  date: String,
  customer: { name: String, email: String, address: String },
  billFrom: { name: String, email: String, address: String },
  currency: String,
  taxRate: Number,
  discountRate: Number,
  items: [{ name: String, description: String, quantity: Number, price: Number }],
  totalAmount: Number,
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 1 },
});

const Counter = mongoose.model("Counter", counterSchema);

// app.post("/api/invoices", async (req, res) => {
//   try {
//     const newInvoice = new Invoice(req.body);
//     await newInvoice.save();
//     res.status(201).json({ message: "✅ Invoice saved successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
app.post("/api/invoices", async (req, res) => {
  try {
    console.log("Received Invoice:", req.body); 
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    res.status(201).json({ message: "✅ Invoice saved successfully!" });
  } catch (error) {
    console.error("Error saving invoice:", error); 
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/invoices/nextInvoiceNumber", async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "invoiceNumber" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    res.json({ invoiceNumber: counter.value });
  } catch (error) {
    res.status(500).json({ error: "Error fetching invoice number" });
  }
});


app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find(); 
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/invoices/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑 Invoice deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
