export const moves={
punch:{label:'Jab',damage:8,start:.04,end:.16,duration:.22,recovery:.22,reach:1.45,height:1.2},
kick:{label:'Roundhouse',damage:12,start:.07,end:.26,duration:.34,recovery:.36,reach:1.85,height:1.1},
uppercut:{label:'Uppercut',damage:17,start:.08,end:.24,duration:.38,recovery:.46,reach:1.4,height:1.5,launch:3.5},
lowcut:{label:'Body hook',damage:10,start:.04,end:.18,duration:.27,recovery:.28,reach:1.45,height:.7},
lowkick:{label:'Leg sweep',damage:11,start:.06,end:.24,duration:.32,recovery:.36,reach:1.8,height:.35},
jumpkick:{label:'Flying kick',damage:16,start:.07,end:.33,duration:.42,recovery:.5,reach:2,height:1.4},
highkick:{label:'High flying kick',damage:20,start:.1,end:.35,duration:.48,recovery:.6,reach:2,height:1.8},
special:{label:'County breaker',damage:27,start:.08,end:.38,duration:.46,recovery:.8,reach:2.3,height:1.2}
};
export const isKick=(kind='')=>kind.includes('kick')||kind==='kick';
export function weaponStats(name){const heavy=['Bathtub','Broken TV','Trash can'].includes(name),long=['Pipe','Broom','Saw'].includes(name);return{reach:heavy?2:long?2.45:1.9,multiplier:heavy?1.75:long?1.35:1.5,durability:heavy?5:long?10:8,speed:heavy?1.3:1,throwDamage:heavy?24:16};}
export function combatOutcome(actors,time){const team=t=>actors.filter(a=>(a.team||0)===t).reduce((s,a)=>s+Math.max(0,a.hp),0),a=team(0),b=team(1);if(a<=0&&b<=0)return'draw';if(b<=0)return'win';if(a<=0)return'lose';if(time<=0)return a===b?'draw':a>b?'win':'lose';return null;}
