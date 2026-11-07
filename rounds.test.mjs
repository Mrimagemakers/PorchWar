import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreRound} from './rules.js';
test('best of three needs two round wins',()=>{let s=scoreRound([0,0],'win');assert.equal(s.over,false);s=scoreRound(s.wins,'lose');assert.equal(s.over,false);s=scoreRound(s.wins,'win');assert.deepEqual(s,{wins:[2,1],over:true,result:'win'});});
test('two straight losses end the match',()=>{const s=scoreRound([0,1],'lose');assert.deepEqual(s,{wins:[0,2],over:true,result:'lose'});});
test('a draw at one-all ends level',()=>{const s=scoreRound([1,1],'draw');assert.deepEqual(s,{wins:[2,2],over:true,result:'draw'});});
