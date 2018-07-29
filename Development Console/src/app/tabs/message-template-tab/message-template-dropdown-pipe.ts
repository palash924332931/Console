import { Pipe, PipeTransform } from '@angular/core';
import { debug } from 'util';
@Pipe ({
    name:'filterOutValuesFromDD',
    pure:true
})
 export class FilterOutValueFromArrayPipe implements PipeTransform  {
    transform(arr:any[],data:any):any[]{
        return  arr.filter((record:any)=>{
            if(record==data){
                return false;
            }else{
                return true
            } 
        });
     }
 }