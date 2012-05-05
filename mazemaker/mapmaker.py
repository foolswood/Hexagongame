# Filename: randmap.py
import math, random

width=6
length=8
n=0
capcolours=["R","G","Y","B"]
lowcolours=["r","g","y","b"]
maplist=[]
directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[0,-1]]
begin=[5,6]

def col(x,y):
    row=maplist[y]
    c=row[x]
    return c

def adjasenttest(x0,y0,co):
    adjasentlist=[]
    n=0
    while n<6:
        direction=directions[n]
        k=direction[0]
        i=direction[1]
        if co==col(x0+k,y0+i):
            x1=x0+(2*k)
            y1=y0+(2*i)
            c1=col(x0,y0)
            coordinates=[x1,y1,c1]
            adjasentlist.append(coordinates)
        n=n+1
    return adjasentlist


while n<length:
    x=0
    newlist="\""
    while x<width:
        colour=random.choice(capcolours)
        newlist=newlist+colour
        if not x==width-1:
            colour=random.choice(lowcolours)
            newlist=newlist+colour
        x=x+1
    newlist=newlist+"\","
    maplist.append(newlist)
    print newlist
    
    newlist="\""
    x=0
    while x<(2*width-1):
        colour=random.choice(lowcolours)
        newlist=newlist+colour
        x=x+1
    newlist=newlist+"\","
    if not n==length-1:
        maplist.append(newlist)
        print newlist
    n=n+1

closepoints=[]
i=0
while i<4:
    colour=lowcolours[i]
    print colour
    print adjasenttest(begin[0],begin[1],colour)
    closepoints=closepoints+adjasenttest(begin[0],begin[1],colour)
    i=i+1

print closepoints


iterations=4
it=0

while it<iterations:
    nmax=len(closepoints)-1
    n=0
    while n<nmax:
        coordinates=closepoints[n]
        c1=str.lower(coordinates[2])
        newcoordinates=adjasenttest(coordinates[0], coordinates[1],c1)
        closepoints=closepoints+newcoordinates
        n=n+1
    it=it+1

print closepoints



