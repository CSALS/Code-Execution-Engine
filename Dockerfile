# Ubuntu based image for creating a sandobox for executing user code.

# FROM some base-image
FROM ubuntu:18.04
MAINTAINER CHARAN, SURYA
LABEL version="0.2"

# Update the repository sources list
RUN apt-get update
RUN apt-get upgrade

#Install all the languages/compilers we are supporting.
RUN apt-get install gcc -y
RUN apt-get install g++ -y