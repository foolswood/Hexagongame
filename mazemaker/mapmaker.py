# Filename: randmap.py
import math, random

width=7
length=9
capcolours=["R","G","Y","B"]
lowcolours=["r","g","y","b"]
maplist=[]
ldirections=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[0,-1]]
hdirections=[[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[0,1]]
begin=[5,6]


def col(x,y):
    try:
        row=maplist[y]
        c=row[x]
    except:
        c="blocked"
    return c

def adjasenttest(x0,y0,co):
    adjasentlist=[]
    n=0
    
    if (x0+1)%4==0:
        directions=ldirections
    else:
        directions=hdirections
    
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

def spread(oldpoints,allpoints):
    nmax=len(oldpoints)-1
    n=0
    newpoints=[]

    while n<nmax:
        coordinates=oldpoints[n]
        c1=str.lower(coordinates[2])
        newcoordinates=adjasenttest(coordinates[0], coordinates[1],c1)
        a=0
        while a<len(newcoordinates):
            count=allpoints.count(newcoordinates[a])+newpoints.count(newcoordinates[a])
            if count==0:
                newpoints.append(newcoordinates[a])
            a=a+1
        n=n+1
    return newpoints

def mapmaking(width, length):
    n=0
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
    return maplist

def possibilitytest(maplist,begin):
    allpoints=[]
    closepoints=[]
    i=0
    while i<4:
        colour=lowcolours[i]
        #print colour
        #print adjasenttest(begin[0],begin[1],colour)
        closepoints=closepoints+adjasenttest(begin[0],begin[1],colour)
        i=i+1

    allpoints=allpoints+closepoints
    print closepoints
    moves=1
    i=0
    while i<1:
        newpoints=spread(closepoints,allpoints)
        allpoints=allpoints+newpoints
        print newpoints
    
        if newpoints==[]:
            i=1
            end=random.choice(closepoints)
        else:
            moves=moves+1
        closepoints=newpoints

    return end, moves, len(allpoints)

maze=mapmaking(width, length)

print possibilitytest(maze,begin)
