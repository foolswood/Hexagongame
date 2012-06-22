# Filename: mapmaker.py
import math, random

width=5
length=5
capcolours=["R","G","Y","B"]
lowcolours=["r","g","y","b"]
maplist=[]
ldirections=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[0,-1]]
hdirections=[[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[0,1]]
begin=[2,2,"w"]
record=[]

def col(x,y):
    try:
        row=maplist[y]
        c=row[x]
    except:
        c="blocked"

    if x<0 or y<0:
        c="blocked"
    return c

def rectmap(width, length):
    n=0
    while n<length:
        x=0
        newlist=[]
        while x<width:
            colour=random.choice(capcolours)
            newlist.append(colour)
            if not x==width-1:
                colour=random.choice(lowcolours)
                newlist.append(colour)
            x=x+1
        maplist.append(newlist)
    
        newlist=[]
        x=0
        while x<(2*width)-1:
            colour=random.choice(lowcolours)
            newlist.append(colour)
            x=x+1

        if not n==length-1:
            maplist.append(newlist)
        n=n+1
    return maplist

def adjasenttest(x0,y0,co):
    adjasentlist=[]
    
    if x0%4==0:
        directions=hdirections
    else:
        directions=ldirections
    
    for n in range(0,6):
        direction=directions[n]
        k=direction[0]
        i=direction[1]
        if co==col(x0+k,y0+i):
            x1=x0+(2*k)
            y1=y0+(2*i)
            c1=col(x0,y0)
            coordinates=[x1,y1,c1]
            adjasentlist.append(coordinates)
        
    return adjasentlist

def spread(oldpoints,allpoints):
    newpoints=[]
    
    for i in oldpoints:
        c1=str.lower(i[2])
        newcoordinates=adjasenttest(i[0], i[1], c1)
        for a in newcoordinates:
            count=allpoints.count(a)+newpoints.count(a)
            if count==0:
                newpoints.append(a)
                record.append([i, a])
    return newpoints

def possibilitytest(maplist,begin):
    closepoints=[]

    if begin[2]=="w":
        closepoints=[[begin[i] for i in range(2)] for i in range(4)]
        n=0
        while n<4:
            closepoints[n].append(capcolours[n])
            record.append([begin,closepoints[n]])
            n=n+1
    else:
        closepoints=[begin]

    allpoints=closepoints
    
    moves=0
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

    return end, moves, allpoints

def removeuseless(maplist, allpoints):

    ymax=len(maplist)
    for y in range(0, ymax, 2):
        xmax=len(maplist[y])
        for x in range(0, xmax, 2):
            n=0
            nmax=len(allpoints)
            count=0
            while n<nmax and count<1:
                point=allpoints[n]
                cut=point.pop()
                if point==[x,y]:
                    count=count+1
                n=n+1
                point.append(cut)
            if count==0:
                maplist[y][x]=" "

    y=0
    while y<ymax:
        x=0
        xmax=len(maplist[y])
        while x<xmax:
            if maplist[y][x]==" ":
                n=0
                if x%4==0:
                    directions=hdirections
                else:
                    directions=ldirections
                while n<6:
                    k=directions[n][0]
                    i=directions[n][1]
                    try:
                        maplist[y+i][x+k]=" "
                    except:
                        pass
                    n=n+1    
            x=x+2
        y=y+2

    for i in maplist:
        i.pop(0)
            
    return maplist

def printnice(maplist):
    ymax=len(maplist)
    y=0
    while y<ymax:
        row=""
        x=0
        xmax=len(maplist[y])
        while x<xmax:
            row=row+maplist[y][x]
            x=x+1
        print '''   "''',row,'''",'''
        y=y+1

def trace(point):
    solution=[point]
    while point!=begin:
        for i in record:
            if i[1]==point:
                solution=[i[0]]+solution
                point=i[0]
                break
    return solution
            


maze=rectmap(width, length)
end, move, allpoints=possibilitytest(maze,begin)
print end, move, len(allpoints)
maze=removeuseless(maze,allpoints)
printnice(maze)

print trace(end)

