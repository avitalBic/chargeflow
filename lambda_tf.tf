############################################################
# [POST] post to paypal URL for payment
############################################################

module "lambda_get_channel_playback" {
  source  = "nodejs-otel-lambda/aws"
  version = "2.0.0"

  name               = "${var.resource_prefix}-connect-billing"
  source_dir         = "./lambdas/connectBilling"
  handler            = "index.handler"
  log_retention_time = var.log_retention_time

  role = aws_iam_role.lambda_secret_role.name

  environment {
    variables = {
      PAYPAL_CLIENT_ID = "paypal_client_id",
      PAYPAL_SECRET    = "paypal_secret",
    }
  }

#  lightstep_access_token          = var.lightstep_access_token
#  otel_service_name               = var.otel_service_name
  awsxray_enabled                 = false
  awsemf_enabled                  = false
  description                     = "lambda connect to billing 3 party"
#  bundle_tags                     = local.default_tags
  runtime                         = local.lambda_runtime
  disable_aws_context_propagation = true

  depends_on = [aws_iam_role.lambda_calculate_amount]
}

output "lambda_function_arn" {
  value = aws_lambda_function.paypal_lambda.arn

}
############################################################
############################################################

module "send-SNS-notification-shipping" {
    source "aws_lambda_function" "send-SNS-notification-shipping" {
      function_name = "send-SNS-notification-shipping"
      runtime = "nodejs14.x"
      handler = "index.handler"
      timeout = 10
      memory_size = 128

      role = aws_iam_role.lambda_role.arn

      filename = "./lambdas/sendSNSNotificationShipping.js" // Path to your Lambda function code

      lifecycle {
        create_before_destroy = true
      }
    }

}


  resource "aws_lambda_permission" "sns_lambda_permission" {
    statement_id  = "AllowSNSInvocation"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.send-SNS-notification-shipping.function_name
    principal     = "sns.amazonaws.com"
    source_arn    = aws_sns_topic.order_shipping.arn
  }

############################################################
############################################################

