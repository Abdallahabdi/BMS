import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailer.js";
import { uploadToImgBB } from "../utils/imageUpload.js";
import { generateToken } from "../utils/generateToken.js";
import { createNotification } from "./notificationController.js";

const validatePassword = (password) => {
  const regex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return regex.test(password);
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    let { name, phone, email, password, gender } = req.body;

    // Basic trimming / sanitization
    name = (name || "").toString().trim();
    phone = (phone || "").toString().trim();
    email = (email || "").toString().trim().toLowerCase();
    gender = (gender || "").toString().trim().toLowerCase();

    // Required checks
    if (!name || !phone || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "Fadlan buuxi dhammaan meelaha banaan."
      });
    }

    // Name length
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, message: "Magacu waa inuu ahaadaa ugu yaraan 2 xaraf oo aan ka badnayn 100." });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Fadlan geli email sax ah." });
    }

    // Phone format (allow leading +, 7-15 digits)
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Fadlan geli number taleefan sax ah (7-15 digits)." });
    }

    // Gender whitelist
    const allowedGenders = ["male", "female", "other"]; // frontend may send localized values, map if needed
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({ success: false, message: "Qiimaha 'gender' waa aan sax ahayn." });
    }

    // Check for existing email or phone
    const existingUser = await User.findOne({ $or: [ { email }, { phone } ] });

    if (existingUser) {
      // More specific message
      if (existingUser.email === email) {
        return res.status(400).json({ success: false, message: "Email-kan horay ayaa loo diiwaangeliyey." });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ success: false, message: "Number-kan taleefanka horay ayuu u diiwaangashan yahay." });
      }
      return res.status(400).json({ success: false, message: "User horay ayuu u diiwaangashan yahay." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password-ku waa inuu ka koobnaadaa 8 xarfood, nambarro iyo calaamado."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      gender,
      email,
      password: hashedPassword
    });

    // Send a welcome email (best-effort)
    try {
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px; max-w-md; margin: auto;">
          <h2 style="color: #059669;">Ku Soo Dhawoow BAAFIN! 🎉</h2>
          <p style="color: #334155; font-size: 16px;">Mudane/Marwo <strong>${user.name}</strong>,</p>
          <p style="color: #334155; font-size: 16px;">Aad ayaan ugu faraxsanahay inaad ku soo biirtay nidaamka <strong>BAAFIN</strong>. Nidaamkan wuxuu kaa caawinayaa inaad hesho alaabtaada luntay ama aad soo sheegto wixii aad hesho.</p>
          <br/>
          <p style="color: #334155; font-size: 14px;">Mahadsanid,</p>
          <p style="color: #059669; font-size: 14px; font-weight: bold;">Maamulka Baafin AI</p>
        </div>
      `;
      await sendEmail(
        user.email,
        "Ku Soo Dhawoow BAAFIN!",
        `Ku soo dhawoow BAAFIN, ${user.name}! Waan ku faraxsanahay inaad nagu soo biirtay.`,
        welcomeHtml
      );

      // Create in-app notification for the new user (best-effort)
      try {
        await createNotification(user._id, `Ku soo dhawoow ${user.name}! Waxaa lagu soo dhoweeyey Baafin.`);
      } catch (nerr) {
        console.warn("Failed to create welcome notification:", nerr.message || nerr);
      }

      // Notify all admins (best-effort): in-app + email
      try {
        const admins = await User.find({ role: 'admin' }).select('email name');
        for (const admin of admins) {
          try {
            await createNotification(admin._id, `Isticmaalaha cusub ${user.name} ayaa isdiiwaan geliyey.`);
          } catch (notifErr) {
            console.warn('Admin notification failed:', notifErr?.message || notifErr);
          }

          if (admin.email) {
            try {
              await sendEmail(
                admin.email,
                `Isticmaalaha cusub: ${user.name}`,
                `Isticmaalaha cusub ${user.name} (${user.email}) ayaa isdiiwaan geliyey.`
              );
            } catch (emailErr) {
              console.warn('Admin email failed:', emailErr?.message || emailErr);
            }
          }
        }
      } catch (adminErr) {
        console.warn('Failed to fetch/notify admins:', adminErr?.message || adminErr);
      }

    } catch (e) {
      console.error("Welcome email failed:", e?.message || e);
    }

    const token = generateToken(user._id, user.role, "7d");

    res.status(201).json({
      success: true,
      message: "Diiwaangelin guul leh.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email iyo password ayaa loo baahan yahay."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User-kan ma jiro."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password-ku waa khaldan yahay."
      });
    }

    const token = generateToken(user._id, user.role, "1d");

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email ayaa loo baahan yahay."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email-kan ma diiwaangashna."
      });
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOTP = otp;

    user.resetOTPExpiry =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log("SENDING OTP TO:", email);
    console.log("GENERATED OTP:", otp);

    // SEND EMAIL
    try {

      await sendEmail(
        email,
        "Password Reset OTP",
        `Koodhkaaga OTP waa: ${otp}. Wuxuu dhacayaa 10 daqiiqo kadib.`
      );

      console.log("OTP SENT SUCCESSFULLY");

    } catch (emailError) {

      console.log(
        "EMAIL ERROR FULL:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message: "Email lama diri karo.",
        error: emailError.message
      });
    }

    res.json({
      success: true,
      message: "OTP ayaa loo diray email-kaaga."
    });

  } catch (error) {

    console.log(
      "FORGOT PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= VERIFY OTP =================
export const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email iyo OTP ayaa loo baahan yahay."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "OTP waa khaldan yahay ama wuu dhacay."
      });
    }

    res.json({
      success: true,
      message: "OTP waa sax."
    });

  } catch (error) {

    console.log("VERIFY OTP ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {

    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Dhammaan xogta waa loo baahan yahay."
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password-ku waa inuu ka koobnaadaa 8 xarfood, nambarro iyo calaamado."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "OTP-gu wuu dhacay ama waa khaldan yahay."
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;

    await user.save();

    res.json({
      success: true,
      message:
        "Password-ka si guul leh ayaa loo beddelay."
    });

  } catch (error) {

    console.log(
      "RESET PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {

    const { name, email, phone, gender } =
      req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User ma jiro."
      });
    }

    if (name) user.name = name;

    if (email) {
      user.email = email.toLowerCase();
    }

    if (phone) {
      user.phone = phone;
    }

    if (gender) {
      user.gender = gender;
    }

    // Upload avatar
    if (req.file) {

      const uploadedImage =
        await uploadToImgBB(req.file.buffer);

      user.avatar = uploadedImage;
    }

    await user.save();

    res.json({
      success: true,
      message:
        "Profile-ka waa la update gareeyay.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar
      }
    });

  } catch (error) {

    console.log(
      "UPDATE PROFILE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};