Build the Container



docker-compose build



**Run Terraform**

bash# Initialize

docker-compose run --rm deployment bash -c "cd terraform \&\& terraform init"



\# Plan

docker-compose run --rm deployment bash -c "cd terraform \&\& terraform plan"



\# Apply

docker-compose run --rm deployment bash -c "cd terraform \&\& terraform apply"



\# Get outputs

docker-compose run --rm deployment bash -c "cd terraform \&\& terraform output"



**Run Ansible**



docker-compose run --rm deployment bash -c "ssh -i /root/.ssh/aws-key.pem ubuntu@13.204.14.36 'echo Connected OK'"



Expected output:



Connected OK 

if not then:
**This removes the old (stale) fingerprint entry for that IP**


docker-compose run --rm deployment bash -c "ssh-keygen -f /root/.ssh/known\_hosts -R 13.204.14.36"



then test again:
docker-compose run --rm deployment bash -c "ssh -i /root/.ssh/aws-key.pem ubuntu@13.204.14.36 'echo Connected OK'"


**Test connectivity:**

docker-compose run --rm deployment bash -c "ansible -i ansible/inventory.ini nextjs -m ping"

**Run the playbook:**

docker-compose run --rm deployment bash -c "ansible-playbook -i ansible/inventory.ini ansible/playbook.yml"









