import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})

@Injectable()
export class FilterPipe implements PipeTransform {
    transform(data: Array<any>, key: any) {
        // console.log('filter pipe called', data, key, data.filter((el) => el.key === key));
        const filtered = data.filter((el) => el.key === key);
        if(filtered?.length)
            return filtered[0].aSituations;
        else 
            return [];
    } 

}