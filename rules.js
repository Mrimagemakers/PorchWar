export const fighters=[
['Bubba',42,'Heavy hitter','Pipe',0xd96932,1.24,.86],['Hank',51,'Counter puncher','Wrench',0xb8a563,1.1,.95],['Charlie',29,'Quick scrapper','Broom',0x659982,.86,1.23],['Lucy',27,'Kick specialist','Lawn chair',0xd26877,1,1.14],['Debbie',46,'Pressure fighter','Toaster',0x9a77ad,1.08,1],['Karen',48,'Technical bruiser','Blender',0xdbce9b,1.04,1.05],['Kevin',24,'Combo specialist','Stool',0x5d89b1,.9,1.2],['Ricky',33,'Wild brawler','Hammer',0xa94b40,1.18,.96],['Becky',31,'Agile striker','Trash can',0x68a5a0,.95,1.17],['Mr. Ronnie',64,'Veteran grappler','Bathtub',0x888b70,1.3,.8],['Earl',57,'Defensive tank','Saw',0x9c794d,1.22,.86],['Jolene',36,'Precision striker','Broken TV',0xc59b43,1.06,1.1]
].map(([name,age,style,prop,color,power,speed],i)=>({name,age,style,prop,color,power,speed,family:[2,3,5,6,7,8].includes(i)?'Smith':'Miller'}));
export const arenas=[
['Trailer Park','Twenty years of silence end when Karen Smith accuses Hank and Bubba Miller of stealing tires from Rick Smith’s garage. The first confrontation spills into the trailer park.','LOT 07'],
['Motel Pool','The accusation reaches the motel cookout. Both families show up to defend their name; a slippery pool deck turns the argument into a brawl.','NO DIVING'],
['Motor Speedway','Rick spots a familiar set of tires in the pits. The Millers deny everything. Then the county’s Best Neighbor trophy vanishes from the awards tent, leaving a second mystery in the feud’s wake.','LAST LAP'],
['Superstore Parking Lot','Karen confronts the Millers outside the superstore. Shopping carts and rival relatives block the way to an explanation.','ROW 12'],
['Flea Market','A rumor places the tires and the missing Best Neighbor trophy at the same bargain stall. Nobody agrees on who brought them, and nobody is backing down.','CASH ONLY'],
['Grocery Store','A routine grocery run turns into another Smith–Miller showdown. Get past the scattered stock and the family enforcer.','AISLE 03'],
['Diner','A flea-market receipt leads to the diner. An attempted peace breakfast collapses when someone brings up the feud from twenty years ago, but a note points to a handoff at the Rusty Nail.','OPEN 24 HRS'],
['Dive Bar','Both families gather at the Rusty Nail to trace the trophy handoff. Old grudges, new accusations, and one very bad toast ignite the biggest bar fight in the county. A regular says the trophy went to bingo.','LAST CALL'],
['Bingo Hall','The missing trophy turns up among the mystery bingo prizes. With the Best Neighbor Award recovered, Karen insists the Smiths deserve it; the Millers demand their own chance to win.','B 12'],
['Gas Station','The trail ends at Last Chance Gas. Fight through Otis Vane’s recovery-yard crew, find Rick’s tires in bay 4, and use the evidence to identify the thief. Closing the case earns the Best Neighbor Award.','COUNTY LINE']];
export function storyBoss(playerIndex,chapter){const family=fighters[playerIndex].family;return fighters.map((_,i)=>i).filter(i=>i!==playerIndex).sort((a,b)=>Number(fighters[a].family===family)-Number(fighters[b].family===family))[chapter];}
export const hazards=['Loose tires','Wet pool deck','Spilled motor oil','Runaway carts','Toppled crates','Spilled groceries','Broken stools','Broken bottles','Fallen bingo chairs','Fuel spill'];
export const weapons=['Stool','Bathtub','Trash can','Pipe','Hammer','Wrench','Saw','Lawn chair','Broom','Broken TV','Toaster','Blender'];
export function damage({kind,power=1,level=1,weapon=false,blocked=false,combo=1}){return Math.round(({punch:8,kick:12,special:27}[kind]||8)*power*(1+(level-1)*.07)*(weapon?1.45:1)*(combo>=3?1.3:1)*(blocked?.22:1));}
export function outcome(player,enemy,time){if(player<=0&&enemy<=0)return'draw';if(enemy<=0)return'win';if(player<=0)return'lose';if(time<=0)return player===enemy?'draw':player>enemy?'win':'lose';return null;}
export function levelFor(xp){return Math.min(20,1+Math.floor(xp/300));}
// Best-of-three round scoring for one-on-one modes. A drawn round counts for both fighters.
export function scoreRound(wins,result,needed=2){const next=[...wins];if(result==='win')next[0]++;else if(result==='lose')next[1]++;else{next[0]++;next[1]++;}const over=Math.max(...next)>=needed;return{wins:next,over,result:over?(next[0]>next[1]?'win':next[0]<next[1]?'lose':'draw'):null};}
