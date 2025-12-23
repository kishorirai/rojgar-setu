const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/User");
const SalesIdCounter = require("../../models/SalesIdCounter");

module.exports = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Get the next salesId
    const counter = await SalesIdCounter.findByIdAndUpdate(
      { _id: 'salesId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const salesId = `SL-${String(counter.seq).padStart(4, '0')}`;

    user = new User({
      firstName,
      lastName,
      email,
      password,
      salesId
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = user.toObject();
    delete payload.password; // Remove password from payload

    jwt.sign(
      payload,
      process.env.SESSION_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};