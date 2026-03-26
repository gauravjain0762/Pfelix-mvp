const User = require("../models/user.model");

exports.updateNotificationSettings = async (req, res) => {
    try {
        const { postMealWalkReminder } = req.body;

        if (postMealWalkReminder === undefined) {
            return res.status(400).json({
                success: false,
                message: "postMealWalkReminder is required"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status
        }
    }
}