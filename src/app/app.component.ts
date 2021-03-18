import { Component, OnInit } from '@angular/core';

type XOTYPE = 'X'|'O'|'';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'xo-game';

  // gameMatrix:Array<Array<XOTYPE>> = [];
  gameMatrix:Array<Array<Cell>> = [];
  userChoice:'X'|'O' = 'X';
  computerChoice:'X'|'O' = 'O';
  takenIndexes:any = {};
  private userIndexes:any = {};
  private cpuIndexes:any = {};
  allIndexes:Array<string>=[];
  winIndexes:Array<Array<string>>=[];
  blockClick:boolean=false;
  userWins:number = 0;
  cpuWins:number = 0;

  constructor(){}

  ngOnInit(){
    // this.gameMatrix = [
    //   ['X','O','X'],
    //   ['X','O','X'],
    //   ['X','O','X']
    // ];
    this.gameMatrix = [
      [new Cell(0,0,'X'), new Cell(0,1,'O'), new Cell(0,2,'X')],
      [new Cell(1,0,'X'), new Cell(1,1,'O'), new Cell(1,2,'X')],
      [new Cell(2,0,'X'), new Cell(2,1,'O'), new Cell(2,2,'X')]
    ];
    this.allIndexes = ['0,0','0,1','0,2','1,0','1,1','1,2','2,0','2,1','2,2'];
    this.winIndexes = [
      ['0,0','0,1','0,2'],
      ['1,0','1,1','1,2'],
      ['2,0','2,1','2,2'],
      ['0,0','1,0','2,0'],
      ['0,1','1,1','2,1'],
      ['0,2','1,2','2,2'],
      ['0,0','1,1','2,2'],
      ['0,2','1,1','2,0'],
    ];
  }

  restartGame(){
    console.log('restart game');
    // this.gameMatrix = [
    //   ['','',''],
    //   ['','',''],
    //   ['','','']
    // ];
    this.gameMatrix.forEach(row=>{
      row.forEach((cell:Cell)=>{
        cell.value = '';
        cell.isWinningPattern = false;
      });
    });
    this.blockClick = false;
    this.takenIndexes={};
    this.userIndexes={};
    this.cpuIndexes={};
  }

  onCellClick(i:number,j:number){
    console.log('cell click = ',i, j);
    if(!this.blockClick){
      // console.log('target = ',ev.target);
      this.gameMatrix[i][j].value = this.userChoice;
      let key:string = [i,j].join(',');
      this.takenIndexes[key] = true;
      this.userIndexes[key] = true;
      this.blockClick = true;
      let winPat:Array<string> = this.checkForWin('user');
      if(winPat.length > 0){
        winPat.forEach((val)=>{
          let ti:number = +val.split(',')[0];
          let tj:number = +val.split(',')[1];
          this.gameMatrix[ti][tj].isWinningPattern = true;
        });
        this.userWins++;
        return;
      }
      this.cpuTurn();
    }
  }

  cpuTurn(){
    console.log('thinking...');
    this.blockClick = true;
    setTimeout(()=>{
      let cpuIndexes:any = this.getCPUIndexes();
      if(!cpuIndexes)
        return;
      let ci:number = cpuIndexes[0];
      let cj:number = cpuIndexes[1];
      this.gameMatrix[ci][cj].value = this.computerChoice;
      let key:string = [ci,cj].join(',');
      this.takenIndexes[key] = true;
      this.cpuIndexes[key] = true;
      this.blockClick = false;
      // let winPat:Array<Array<string>> = this.checkForWin('cpu');
      let winPat:Array<string> = this.checkForWin('cpu');
      if(winPat.length > 0){
        winPat.forEach((val)=>{
          let ti:number = +val.split(',')[0];
          let tj:number = +val.split(',')[1];
          this.gameMatrix[ti][tj].isWinningPattern = true;
        });
        this.blockClick = true;
        this.cpuWins++;
        return;
      }
    }, 1000);
  }

  private getCPUIndexes():Array<number>|boolean{
    let res = new Array(2);
    console.log('taken = ',this.takenIndexes);
    let availableIndexes:Array<string> = this.allIndexes.filter((pair)=>{
      return !this.takenIndexes[pair];
    });
    console.log('avail = ',availableIndexes);
    let len:number = availableIndexes.length;
    if(len > 0){
      res = this.getSmartChoice(availableIndexes, len);
      console.log('res = ',res);
      return res;
    }
    else{
      return false;
    }
  }

  private getRandomChoice(availableIndexes:Array<string>, len:number){
    return availableIndexes[Math.floor(Math.random() * 10)%len].split(',').map((n)=>parseInt(n));
  }

  private getSmartChoice(availableIndexes:Array<string>, len:number){
    let allUserKeys:Array<string> = Object.keys(this.userIndexes);
    if(allUserKeys.length >=2){
      let winPat:Array<string> = this.findWinPattern(allUserKeys);
      let res:string | undefined = availableIndexes.find((pair)=>{
        return (winPat.indexOf(pair) >= 0);
      });
      if(res){
        return res.split(',').map((n)=>parseInt(n));
      }
      return this.getRandomChoice(availableIndexes,len);
    }
    return this.getRandomChoice(availableIndexes,len);
  }

  private checkForWin(of:'user'|'cpu'){
    console.log('checking for win');
    let allUserKeys:Array<string> = Object.keys(this.userIndexes);
    let allCPUKeys:Array<string> = Object.keys(this.cpuIndexes);
    if(allUserKeys.length > 2 || allCPUKeys.length > 2){
      if(of == 'user'){
        return this.findWinPattern(allUserKeys);
      }
      if(of == 'cpu'){
        return this.findWinPattern(allCPUKeys);
      }
      else{
        return [];
      }
    }
    else{
      return [];
    }
  }

  private findWinPattern(allKeys:Array<string>){
    let winPatterns:Array<Array<string>> = this.winIndexes;
    console.log('all keys = ',allKeys);
    let winPattern:Array<string> = [];
    winPatterns.forEach(win=>{
      let count:number=0;
      win.forEach((idxs)=>{
        let found:any = allKeys.find((k)=>{
          return k == idxs;
        });
        if(found){
          count++;
        }
      });
      if(count == 3){
        winPattern = win;
        return;
      }
    });
    // for(let i=(allKeys.length - 3); i < allKeys.length; i++){
    //   winPatterns = winPatterns.filter((pat)=>{
    //     return pat.indexOf(allKeys[i]) > -1;
    //   });
    //   console.log('mid patt = ', winPatterns.join(' | '));
    // }
    console.log('win pattern = ',winPattern);
    return winPattern;
  }
}

class Cell{
  row:number=0;
  col:number=0;
  value:XOTYPE='';
  isWinningPattern:boolean = false;
  constructor(r:number,c:number,val:XOTYPE){
    this.row =r;
    this.col = c;
    this.value = val;
  }
}
