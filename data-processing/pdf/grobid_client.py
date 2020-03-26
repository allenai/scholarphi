import requests
import json

def get_pdf_structure(pdf_file):
    """
    Get parsed PDF data from a local instance of the Grobid service
    :param pdf_file:
    :return:
    """
    try:
        files = {'input':(pdf_file, open(pdf_file,'rb'), 'application/pdf',{'Expires':'0'})}
        resp = requests.post('http://localhost:8070/api/processPdfStructure',files=files)

        if resp.status_code == 200:
            return json.loads(resp.text)
        else:
            raise Exception("Grobid returned status code {}".format(resp.status_code))
    except requests.exceptions.ConnectionError:
        msg="""Could not connect to local grobid service.
         To start the service, run 'docker pull 896129387501.dkr.ecr.us-west-2.amazonaws.com/grobid-server:pdf-structure' 
         followed by 'docker run --rm -d --name local-grobid -p 8070:8070 -p 8071:8071 896129387501.dkr.ecr.us-west-2.amazonaws.com/grobid-server:pdf-structure
        """
        raise Exception(msg)

