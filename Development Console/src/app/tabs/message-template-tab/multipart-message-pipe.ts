import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'splitter'
})
export class SplitterPipe implements PipeTransform {
  transform(value: string, spitedBy: string,arrayIndex:number=0): string {
      let returnValues="";
      if(value==""|| value==null){
        returnValues="";
      }else{
        returnValues=value.split(spitedBy)[arrayIndex];
      }    

    return returnValues;
  }
}