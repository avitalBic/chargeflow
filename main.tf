terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.58.0"
    }
  }
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
}

locals {
  default_tags = {
    ApplicationName = "chargeflow_exercise"
  }
  lambda_default_env_vars = {
    NODE_PATH = "/opt:/opt/nodejs/${split(".", local.lambda_runtime)[0]}/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task"
  }
#  api_path_prefix          = var.is_dev_build ? "/${var.resource_prefix}/quortex" : "/quortex"
  lambda_runtime           = "nodejs18.x"
  quortex_secret_base_name = "/user/chargflow/orgSecret/"
  default_processing = jsonencode([
    { name : "1080p, 25 fps", id : "1080_25" },
    { name : "720p, 25 fps", id : "720_25" },
    { name : "540p, 25 fps", id : "540_25" }
  ])
  default_targets = jsonencode(["dash", "hls"])
  default_tokens = jsonencode([
    {
      token : "chargeflow_exerciseProcessingAll",
      rules : [
        {
          "match" : "deviceFeatures~='SecondScreen'",
          "replace" : "540_25"
        },
        {
          "match" : "deviceFeatures~='FirestScreen'",
          "replace" : "720_25"
        },
        {
          "match" : "default",
          "replace" : "1080_25"
        }
      ]
    },
    {
      token : "quortexProcessingL",
      rules : [
        {
          "match" : "deviceFeatures~='SecondScreen'",
          "replace" : "540_25"
        },
        {
          "match" : "default",
          "replace" : "720_25"
        }
      ]
    },
    {
      token : "quortexProcessingH",
      rules : [
        {
          "match" : "deviceFeatures~='SecondScreen'",
          "replace" : "720_25"
        },
        {
          "match" : "default",
          "replace" : "1080_25"
        }
      ]
    },
    {
      token : "quortexProcessingM",
      rules : [
        {
          "match" : "deviceFeatures~='SecondScreen'",
          "replace" : "540_25"
        },
        {
          "match" : "default",
          "replace" : "1080_25"
        }
      ]
    },
    {
      token : "quortexTarget",
      rules : [
        {
          "match" : "deviceFeatures~='HLS'",
          "replace" : "hls"
        },
        {
          "match" : "deviceFeatures~='DASH'",
          "replace" : "dash"
        }
      ]
    }
  ])
  tokens_to_processing = jsonencode([
    { token : "chargflowProcessingAll", processings : ["1080_25", "720_25", "540_25"] }
#    { token : "quortexProcessingL", processings : ["720_25", "540_25"] },
#    { token : "quortexProcessingH", processings : ["1080_25", "720_25"] },
#    { token : "quortexProcessingM", processings : ["1080_25", "540_25"] }
  ])
}
