import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendTaskAssignmentEmail(userEmail, userName, taskTitle, taskDescription, deadline) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Task Assigned</h2>
          <p>Hello ${userName},</p>
          <p>You have been assigned a new task:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Task Details:</h3>
            <p><strong>Title:</strong> ${taskTitle}</p>
            <p><strong>Description:</strong> ${taskDescription || 'No description provided'}</p>
            <p><strong>Deadline:</strong> ${deadline ? new Date(deadline).toLocaleDateString() : 'No deadline set'}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>
          
          <p>Please log in to your account to view and manage your tasks.</p>
          <p>Best regards,<br>Task Management System</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Task assignment email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendTaskStatusUpdateEmail(userEmail, userName, taskTitle, newStatus, updatedBy) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Task Status Updated: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Status Updated</h2>
          <p>Hello ${userName},</p>
          <p>The status of your task has been updated:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Task Details:</h3>
            <p><strong>Title:</strong> ${taskTitle}</p>
            <p><strong>New Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' ')}</p>
            <p><strong>Updated by:</strong> ${updatedBy}</p>
          </div>
          
          <p>Please log in to your account to view the updated task details.</p>
          <p>Best regards,<br>Task Management System</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Task status update email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default new EmailService();
