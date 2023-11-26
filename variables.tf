variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "resource_prefix" {
  type        = string
  description = "Prefix to add to all resource name."
  default     = "development"
}

variable "log_retention_time" {
  type        = number
  description = "Number of days logs are retained in CloudWatch"
  default     = 7
}