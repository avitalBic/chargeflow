const { PAYPAL_CLIENT_ID, PAYPAL_SECRET} = process.env;
const [paypalClientID, paypalSecret] = [JSON.parse(PAYPAL_CLIENT_ID), JSON.parse(PAYPAL_SECRET)];

async function customFetch(url, method, headers = {}, body = null) {
    const res = await fetch(url, {
        method,
        ...(!!body && { body: JSON.stringify(body) }),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`${data}`);
    return data;
}

export const handler = async (event) => {
    try {
        // Extract amount and user details from the Lambda event
        const { amount, userDetails } = JSON.parse(event.body);

        // Set up PayPal API credentials and endpoint using environment variables
        const clientId = paypalClientID;
        const secret = paypalSecret;
        const paypalEndpoint = 'https://api.paypal.com/v2/checkout/orders';

        // Create a PayPal order
        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: amount,
                    },
                },
            ],
        };

        // Make the request to PayPal using the customFetch function
        const response = await customFetch(paypalEndpoint, 'POST', {
            'Authorization': `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
        }, orderData);

        // Assuming the PayPal API responds with the order ID
        const orderId = response.id;

        // Process the user details and PayPal response as needed

        // Return a success response
        const successResponse = {
            statusCode: 200,
            body: JSON.stringify({ orderId, message: 'Payment successful' }),
        };

        return successResponse;
    } catch (error) {
        // Handle errors and return an error response
        console.error('Error:', error);

        const errorResponse = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Billing Internal server error' }),
        };

        return errorResponse;
    }
};
