import { SNSClient, ListTopicsCommand } from "@aws-sdk/client-sns";

export const handler = async (event) => {
    try {
        const client = new SNSClient({ region: "REGION" });
        // Assuming you have the orderId and customerEmail in the event object
        const { orderId, customerEmail } = event;

        // Construct the message
        const message = {
            content: 'Your order has been shipped!',
            orderId: orderId,
            mail: customerEmail,
            shipmentDetails: {
                // Add any additional shipment details here
                // Example: trackingNumber: '123456789',
            },
        };
        // Publish the message to the SNS topic using the SNS client
        const params = {
            Message: JSON.stringify(message),
            TopicArn: 'arn:aws:sns:your-region:your-account-id:order-shipping', // Update with your SNS topic ARN
            Subject : "order shipping",
        };

        const command = new ListTopicsCommand(params);
        const data = await client.send(command);

        console.log('Message published to SNS:', data);

        return {
            statusCode: 200,
            body: JSON.stringify('Message published to SNS successfully'),
        };
    } catch (error) {
        console.error('Error publishing message to SNS:', error);

        return {
            statusCode: 500,
            body: JSON.stringify('Error publishing message to SNS'),
        };
    }
};
