- Docker is operating-system-level virtualization
- Docker containers OS are based on the local machine OS kernel. Unlike VM docker won't provide isolated OS. All containers share same kernel (Docker vs virtualization)
- Docker makes it easier to create and deploy applications in an isolated environment.

- A sandbox is a testing environment that isolates untested code changes and outright experimentation from the production environment or repository,[1] in the context of software development including Web development and revision control.
- This project will be a Docker based sandbox which runs untrusted code and return the output to the user
- The system will test the code in an isolated environment. This way you do not have to worry about untrusted code possibly damaging your server intentionally or unintentionally. 
- You can use this system to allow your users to compile their code right in the browser.

- Docker Image = is a template to create many containers from that image
- Docker container = running instance of the image (isolated and have their own environment)
- Analogy = Image is like program and container is like process

- Dockerfile = builds our own image based on instructions in it.
We need to build an ubuntu based image for executing user code.


## FEATURES
- download the code file & upload a code file (frontend tasks)
- save the user code in browser local store
- generate url for the code (need to use DB for this.)

## TODO
- code files are not getting deleted

## optimizations
- is base image good? Shifted to alpine. Very light-weight. very less size than ubuntu (<50MB , 150+MB)
- is it better to install all compilers in just one image? maybe try different images for each langugae (DONE)