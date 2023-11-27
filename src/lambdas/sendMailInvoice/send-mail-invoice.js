import { SESClient, ListIdentitiesCommand } from "@aws-sdk/client-ses";

export const handler = async (event) => {
    try {
        const client = new SESClient({});
        // Assuming you have the customer's email and amount in the event object
        const { customerEmail, amount, orderId } = event;

        // Construct the email parameters
        const params = {
            Destination: {
                ToAddresses: [customerEmail],
            },
            Message: {
                Body: {
                    Text: {
                        Data: `Thank you for your purchase! Your order $${orderId} have been done, the total amount is $${amount}.`,
                    },
                },
            },
            Source: 'your-sender-email@example.com', // Update with your SES verified email address
            Subject: {
                Data: 'Purchase Confirmation',
            },
        };

        // Send the email
        const command = new ListIdentitiesCommand(params);
        const data = await client.send(command);
        console.log('Email sent:', data);

        return {
            statusCode: 200,
            body: JSON.stringify('Email sent successfully'),
        };
    } catch (error) {
        console.error('Error sending email:', error);

        return {
            statusCode: 500,
            body: JSON.stringify('Error sending email'),
        };
    }
};
