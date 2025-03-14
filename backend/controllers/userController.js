const { Menu, Role, Permission, User } = require("../models");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const key = require("../configs/key");
sgMail.setApiKey(key.sendgrid.api_key);

// Menu Management
exports.createMenu = async (req, res) => {
  try {
    const { menu_name, menu_icon, route } = req.body;
    const menu = await Menu.create({
      menu_name,
      menu_icon,
      route,
    });

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [["order", "ASC"]],
    });
    res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// Role Management
exports.createRole = async (req, res) => {
  try {
    const { role_name, permissions } = req.body;

    // Create role
    const role = await Role.create({ role_name });

    // If permissions are provided, create them
    if (permissions && permissions.length > 0) {
      const permissionRecords = permissions.map((perm) => ({
        role_id: role.id,
        menu_id: perm.menu_id,
        create: perm.create || false,
        read: perm.read || false,
        update: perm.update || false,
        delete: perm.delete || false,
        download: perm.download || false,
      }));

      await Permission.bulkCreate(permissionRecords);
    }

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          include: [Menu],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const { role_id } = req.params;

    const rolePermissions = await Permission.findAll({
      where: { role_id },
      include: [
        {
          model: Menu,
          attributes: ["id", "menu_name", "route"],
        },
      ],
      attributes: ["create", "read", "update", "delete", "download"],
    });

    res.status(200).json({
      success: true,
      data: rolePermissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { permissions } = req.body;

    // Delete existing permissions for this role
    await Permission.destroy({
      where: { role_id },
    });

    // Create new permissions
    if (permissions && permissions.length > 0) {
      const permissionRecords = permissions.map((perm) => ({
        role_id,
        menu_id: perm.menu_id,
        create: perm.create || false,
        read: perm.read || false,
        update: perm.update || false,
        delete: perm.delete || false,
        download: perm.download || false,
      }));

      await Permission.bulkCreate(permissionRecords);
    }

    res.status(200).json({
      success: true,
      msg: "Role permissions updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// User Role Management
exports.assignUserRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    await user.update({ role_id });

    res.status(200).json({
      success: true,
      msg: "Role assigned successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getUserPermissions = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: { id: decoded?.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const permissions = await Permission.findAll({
      where: { role_id: user.role_id, read: true },
      include: [Menu],
    });
    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          attributes: ["id", "role_name"],
        },
      ],
      attributes: { exclude: ["password", "token"] },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      msg: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    await User.update({ role_id }, { where: { id } });

    res.status(200).json({
      success: true,
      msg: "User role updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getPermissions = async (req, res) => {
  const permissions = await Permission.findAll({
    include: [
      {
        model: Role,
        attributes: ["id", "role_name"],
      },
      {
        model: Menu,
        attributes: ["id", "menu_name", "route"],
      },
    ],
  });
  res.status(200).json({
    success: true,
    data: permissions,
  });
};

exports.updatePermission = async (req, res) => {
  const { id } = req.params;
  const { create, read, update, delete: deletePermission, download } = req.body;
  await Permission.update(
    { create, read, update, delete: deletePermission, download },
    { where: { id } }
  );
  res
    .status(200)
    .json({ success: true, msg: "Permission updated successfully" });
};

exports.getMenus = async (req, res) => {
  const menus = await Menu.findAll();
  res.status(200).json({ success: true, data: menus });
};

exports.createPermission = async (req, res) => {
  const {
    role_id,
    menu_id,
    create,
    read,
    update,
    delete: deletePermission,
    download,
  } = req.body;
  await Permission.create({
    role_id,
    menu_id,
    create,
    read,
    update,
    delete: deletePermission,
    download,
  });
  res
    .status(200)
    .json({ success: true, msg: "Permission created successfully" });
};

exports.updateUserEmail = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ msg: "Email already exists" });
  }
  await User.update({ email }, { where: { id } });
  res
    .status(200)
    .json({ success: true, msg: "User email updated successfully" });
};

exports.updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.update({ password: hashedPassword }, { where: { id } });
  res
    .status(200)
    .json({ success: true, msg: "User password updated successfully" });
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    await User.update({ is_active }, { where: { id } });

    const msg = {
      to: user.email,
      from: key.sendgrid.sender_email,
      subject: `Account ${
        is_active ? "Activated" : "Deactivated"
      } - AmDream Team Notice`,
      text: `Your account status has been ${
        is_active ? "activated" : "deactivated"
      } by the administrator.`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin-bottom: 10px; font-size: 28px;">AmDream Team</h1>
            <div style="width: 100%; height: 4px; background: linear-gradient(45deg, #1a237e, #0d47a1, #2196F3); margin: 20px 0; border-radius: 2px;"></div>
          </div>
          
          <!-- Main Content -->
          <div style="color: #424242; font-size: 16px; line-height: 1.6;">
            <p style="font-size: 18px;">Dear ${user.first_name} ${
        user.last_name
      },</p>
            
            <p>We hope this message finds you well. This is an important notification regarding your AmDream Team account status.</p>
            
            <!-- Status Box -->
            <div style="background-color: ${is_active ? "#e8f5e9" : "#ffebee"}; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 25px 0;
                        border-left: 5px solid ${
                          is_active ? "#4CAF50" : "#f44336"
                        };
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <h2 style="margin: 0 0 15px 0; color: ${
                is_active ? "#2e7d32" : "#c62828"
              }; font-size: 20px;">
                Account Status Update
              </h2>
              <p style="margin: 0; font-size: 16px;">
                Your account has been <strong style="color: ${
                  is_active ? "#2e7d32" : "#c62828"
                }">${is_active ? "ACTIVATED" : "DEACTIVATED"}</strong>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                Updated on: ${new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <p>If you believe this change was made in error or have any questions, please don't hesitate to contact our support team.</p>
            
            <!-- Contact Section -->
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1a237e; margin: 0 0 15px 0; font-size: 18px;">Need Assistance?</h3>
              <p style="margin: 0;">Contact AmDream Team Support:</p>
              <ul style="list-style: none; padding: 0; margin: 10px 0 0 0;">
                <li style="margin: 5px 0;">📧 Email: ${
                  key.sendgrid.recipient_email
                }</li>
                <li style="margin: 5px 0;">⏰ Hours: Monday - Friday, 9:00 AM - 6:00 PM</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">This is an automated message from AmDream Team. Please do not reply directly to this email.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} AmDream Team. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({
      success: true,
      msg: "User status updated successfully and notification sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
