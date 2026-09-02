output "instance_public_ip" {
  description = "Public IP address of the MERN server"
  value       = aws_instance.mern_server.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the MERN server"
  value       = aws_instance.mern_server.public_dns
}
