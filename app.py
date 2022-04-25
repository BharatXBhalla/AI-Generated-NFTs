import pickle
from flask import Flask
from flask import request
from flask_cors import CORS
import os
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder
import torchvision.transforms as T
import torch
from torchvision.utils import make_grid
import matplotlib.pyplot as plt
import torch.nn as nn


def save_samples(index, latent_tensors, show=True):
    fake_images = generator(latent_tensors)
    print(fake_images.shape)
    fake_fname = 'generated-images-{0}.png'.format(index)
    save_image(denorm(fake_images), os.path.join("F:/proj/AI-Generated-NFTs/img", fake_fname), nrow=8)
    return "img/"+fake_fname
    if show:
        fig, ax = plt.subplots(figsize=(8, 8))
        ax.set_xticks([]); ax.set_yticks([])
        ax.imshow(make_grid(fake_images.cpu().detach(), nrow=8).permute(1, 2, 0))

def show_images(images, nmax=64):
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.set_xticks([]); ax.set_yticks([])
    ax.imshow(make_grid(denorm(images.detach()[:nmax]), nrow=8).permute(1, 2, 0))
def show_batch(dl, nmax=64):
    for images, _ in dl:
        show_images(images, nmax)
        break

def get_default_device():
    """Pick GPU if available, else CPU"""
    if torch.cuda.is_available():
        return torch.device('cuda')
    else:
        return torch.device('cpu')
    
def to_device(data, device):
    """Move tensor(s) to chosen device"""
    if isinstance(data, (list,tuple)):
        return [to_device(x, device) for x in data]
    return data.to(device, non_blocking=True)

class DeviceDataLoader():
    """Wrap a dataloader to move data to a device"""
    def __init__(self, dl, device):
        self.dl = dl
        self.device = device
        
    def __iter__(self):
        """Yield a batch of data after moving it to device"""
        for b in self.dl: 
            yield to_device(b, self.device)

    def __len__(self):
        """Number of batches"""
        return len(self.dl)
device = get_default_device()

def denorm(img_tensors):
    return img_tensors * stats[1][0] + stats[0][0]
    
image_size = 64
batch_size = 128
stats = (0.5, 0.5, 0.5), (0.5, 0.5, 0.5)
latent_size = 128


generator = nn.Sequential(
    # in: latent_size x 1 x 1

    nn.ConvTranspose2d(latent_size, 512, kernel_size=4, stride=1, padding=0, bias=False),
    nn.BatchNorm2d(512),
    nn.ReLU(True),
    # out: 512 x 4 x 4

    nn.ConvTranspose2d(512, 256, kernel_size=4, stride=2, padding=1, bias=False),
    nn.BatchNorm2d(256),
    nn.ReLU(True),
    # out: 256 x 8 x 8

    nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1, bias=False),
    nn.BatchNorm2d(128),
    nn.ReLU(True),
    # out: 128 x 16 x 16

    nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1, bias=False),
    nn.BatchNorm2d(64),
    nn.ReLU(True),
    # out: 64 x 32 x 32

    nn.ConvTranspose2d(64, 3, kernel_size=4, stride=2, padding=1, bias=False),
    nn.Tanh()
    # out: 3 x 64 x 64
)
generator = to_device(generator, device)
generator.load_state_dict(torch.load('F:/proj/AI-Generated-NFTs/gan_model_2.pth', map_location=torch.device('cpu')))
from torchvision.utils import save_image


app = Flask(__name__,static_url_path='', 
            static_folder='',
            template_folder='')
CORS(app)

# class Model:
#     def __init__(self):
#         self.modelloaded=False
#     def load_model(self,filename):
#         if(self.modelloaded==False):
#             self.model=pickle.load(open(filename, 'rb'))
#     def predict(self,input):
#         return self.model.predict(input)
import time
import string
import random


                    
@app.route("/generate",methods=['GET','POST'])
def generate():
    # fixed_latent = torch.randn(1, 128, 1, 1, device=device)
    # ima=denorm(generator(fixed_latent.detach())[:64]).cpu().detach()[0].mT.mT
    res = ''.join(random.choices(string.ascii_uppercase +
                             string.digits, k = 7))
    # save_image(ima, 'img/'+str(res)+'.jpg')
    xb = torch.randn(64, latent_size, 1, 1) 

    # return 'img/'+str(res)+'.jpg'
    return save_samples(res, xb,False)

# model=Model()
# model.load_model(os.getcwd()+"/"+model_file_name)

if __name__=="__main__": 
    app.run()



