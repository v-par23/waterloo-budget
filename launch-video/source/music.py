import numpy as np, scipy.signal as sg, wave
SR=44100;BPM=128;B=60/BPM;BAR=4*B;BARS=26;N=int(BARS*BAR*SR)+SR
L=np.zeros(N);R=np.zeros(N)
rng=np.random.default_rng(7)
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR);n=min(len(sig),N-i)
    if n<=0:return
    L[i:i+n]+=sig[:n]*g*(1-max(0,pan));R[i:i+n]+=sig[:n]*g*(1+min(0,pan))
def env(n,a,d):
    t=np.arange(n)/SR;e=np.minimum(1,t/max(a,1e-4))*np.exp(-t/d);return e
def kick():
    n=int(.45*SR);t=np.arange(n)/SR;f=45+110*np.exp(-t*28);ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-t*6.5);s+=0.3*np.exp(-t*300)*rng.standard_normal(n)*.3;return np.tanh(s*1.6)
def clap():
    n=int(.3*SR);x=rng.standard_normal(n);b,a=sg.butter(2,[900/(SR/2),5000/(SR/2)],'band');x=sg.lfilter(b,a,x)
    t=np.arange(n)/SR;e=np.exp(-t*18)+0.6*np.exp(-np.maximum(0,t-.012)*60)*(t>.012);return x*e*1.6
def hat(d=.05):
    n=int(.12*SR);x=rng.standard_normal(n);b,a=sg.butter(2,7000/(SR/2),'high');return sg.lfilter(b,a,x)*env(n,.001,d)*.5
def tick():
    n=int(.04*SR);x=rng.standard_normal(n);b,a=sg.butter(2,3000/(SR/2),'high');return sg.lfilter(b,a,x)*env(n,.0005,.008)
def saw(f,n,det=(-.12,-.05,0,.05,.12)):
    t=np.arange(n)/SR;s=np.zeros(n)
    for d in det:s+=sg.sawtooth(2*np.pi*f*(2**(d/12))*t+rng.random()*6)
    return s/len(det)
def lp(x,fc):b,a=sg.butter(2,fc/(SR/2));return sg.lfilter(b,a,x)
mid=lambda m:440*2**((m-69)/12)
# chords Am F C G (minor-ish energetic): roots A2 F2 C3 G2
prog=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]
roots=[33,29,36,31]
def chord(ci,dur,fc=3000,g=.22):
    n=int(dur*SR);s=sum(saw(mid(m),n) for m in prog[ci]);s=lp(s,fc);return s*env(n,.01,dur*2)*g
def bassnote(m,dur):
    n=int(dur*SR);t=np.arange(n)/SR;s=np.sign(np.sin(2*np.pi*mid(m)*t))*.5+np.sin(2*np.pi*mid(m)*t)
    return lp(s,500)*env(n,.003,dur*.8)*.5
def impact():
    n=int(2.5*SR);t=np.arange(n)/SR;s=np.sin(2*np.pi*(40+60*np.exp(-t*10))*t)*np.exp(-t*2.2)
    x=lp(rng.standard_normal(n),2500)*np.exp(-t*4)*.5;return np.tanh((s+x)*1.5)
def riser(dur):
    n=int(dur*SR);t=np.arange(n)/SR;x=rng.standard_normal(n);out=np.zeros(n);blk=2048
    for i in range(0,n,blk):
        fc=300+ (t[i]/dur)**2*9000;b,a=sg.butter(2,min(fc,19000)/(SR/2));out[i:i+blk]=sg.lfilter(b,a,x[i:i+blk])
    return out*(t/dur)**2*.5
def stab(ci,g=.3):return chord(ci,.22,5000,g)*1
K,C=kick(),clap()
# sidechain envelope
sc=np.ones(N)
def duck(t):
    i=int(t*SR);n=int(.35*SR);e=1-.75*np.exp(-np.arange(n)/SR/0.09)
    n=min(n,N-i);sc[i:i+n]=np.minimum(sc[i:i+n],e[:n])
padL=np.zeros(N);padR=np.zeros(N)
def addpad(sig,t,g=1):
    i=int(t*SR);n=min(len(sig),N-i);padL[i:i+n]+=sig[:n]*g;padR[i:i+n]+=np.roll(sig[:n],220)*g
# Intro bars 0-1: kick+stab per beat, printer ticks
for bt in range(8):
    t=bt*B;add(K,t,.9)
    for k in range(4):add(tick(),t+k*B/4,.25,pan=.3)
    if bt<7:add(stab(bt//2%4),t,.9)
add(impact(),7*B,.9);add(C,7*B,.8)
# Build bars 2-3
for bt in range(8):
    add(K,(8+bt)*B,.6 if bt<7 else 0)
rolls=[]
t=2*BAR
for i in range(32):
    tt=2*BAR+i*(2*BAR/32)
    if i>=16:
        add(C,tt,.25+.5*i/32)
        add(C,tt+B/4 if i>=24 else tt,.0)
    else:
        if i%2==0:add(C,tt,.3)
add(riser(2*BAR),2*BAR,1.0)
addpad(chord(0,2*BAR,900,.18),2*BAR)
# Drop bars 4-21 main groove; bars 22-23 outro
def groove(b0,b1,hats=True,arp=True):
    for bar in range(b0,b1):
        ci=bar%4
        addpad(chord(ci,BAR,3800,.2),bar*BAR)
        for bt in range(4):
            t=bar*BAR+bt*B;add(K,t,1.0);duck(t)
            if bt in(1,3):add(C,t,.7)
            if hats:add(hat(),t+B/2,.8,pan=-.2);add(hat(.02),t+B/4,.35,pan=.2);add(hat(.02),t+3*B/4,.35,pan=.2)
            for k in (0.5,1.5):pass
            add(bassnote(roots[ci]+12,B/2*0.9),t+B/2,1)
            add(bassnote(roots[ci],B/2*0.9),t,.6)
        if arp:
            notes=prog[ci]+[prog[ci][1]+12]
            for s in range(16):
                m=notes[[0,2,1,3,4,3,2,1][s%8]]+12;n=int(B/4*SR);tt=np.arange(n)/SR
                sig=sg.square(2*np.pi*mid(m)*tt,.3)*env(n,.002,.07)*.07
                add(lp(sig,6000),bar*BAR+s*B/4,1,pan=.4 if s%2 else -.4)
add(impact(),4*BAR,1.0);add(C,4*BAR,.8)
groove(4,12,arp=False);groove(12,21,arp=True)
# bar 21 rapid fire: groove + snare 8ths build + riser
groove(21,22,hats=True,arp=True)
for i in range(8):add(C,21*BAR+i*B/2,.35+i*.05)
add(riser(BAR),21*BAR,.8)
# transition impacts at section cuts
for b_ in [6,8,10,12,14,16,17,19]:add(hat(.25)*1.5,b_*BAR-0.0,.35)
# outro bars 22-26
add(impact(),22*BAR,1.0)
addpad(chord(0,3.8*BAR,2500,.3),22*BAR)
for bar in range(22,25):
    for bt in range(4):
        t=bar*BAR+bt*B;add(K,t,.8);duck(t)
        if bt in(1,3):add(C,t,.5)
        add(hat(),t+B/2,.6)
    add(bassnote(roots[0],BAR*.9),bar*BAR,.8)
add(K,25*BAR,.9);add(stab(0,.5),25*BAR)
mixL=L+padL*sc;mixR=R+padR*sc
# fade last bar
f0=int(25.3*BAR*SR);f1=int(26*BAR*SR);fade=np.ones(N);fade[f0:f1]=np.linspace(1,0,f1-f0);fade[f1:]=0
mixL*=fade;mixR*=fade
m=np.stack([mixL,mixR],1);m=m/np.max(np.abs(m))*0.95;m=np.tanh(m*1.25)/np.tanh(1.25)
m=m[:int(26*BAR*SR)]
w=wave.open('music.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((m*32767).astype(np.int16).tobytes());w.close()
print(len(m)/SR)
