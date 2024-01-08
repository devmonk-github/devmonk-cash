import { Injectable } from '@angular/core';

@Injectable()
export class TransactionAuditService {

    constructor() { }

    processCompareData(oBody: any) {
        const { aStatisticResponse, aCompareData } = oBody;
        const oProcessedArray = new Map();

        // console.log('------aStatisticResponse------', aStatisticResponse);

        function processIndividual(oIndividual: any, index: number) {
            // console.log('------processIndividual------', oIndividual);
            const key = oIndividual.sBusinessPartnerName || oIndividual.sCategory || oIndividual.sName;

            if (!oProcessedArray.has(key)) {
                oProcessedArray.set(key, {
                    sBusinessPartnerName: oIndividual.sBusinessPartnerName || oIndividual.sCategory || oIndividual.sName,
                    aValues: Array.from({ length: aStatisticResponse.length }, (_, i) => ({
                        nTotalRevenue: i === index ? oIndividual.nTotalRevenue : 0,
                        nQuantity: i === index ? oIndividual.nQuantity : 0
                    })),
                    aArticleGroup: oIndividual?.aArticleGroups?.map((group: any) => ({
                        sName: group.sName,
                        aValues: Array.from({ length: aStatisticResponse.length }, (_, i) => ({
                            nTotalRevenue: i === index ? group.nTotalRevenue : 0,
                            nQuantity: i === index ? group.nQuantity : 0
                        })),
                    })),
                });
            } else {
                const existingEntry = oProcessedArray.get(key);
                existingEntry.aValues[index].nTotalRevenue += oIndividual.nTotalRevenue;
                existingEntry.aValues[index].nQuantity += oIndividual.nQuantity;

                oIndividual?.aArticleGroups?.forEach((group: any) => {
                    const existingGroup = existingEntry.aArticleGroup.find((g: any) => g.sName === group.sName);
                    if (existingGroup) {
                        existingGroup.aValues[index].nTotalRevenue += group.nTotalRevenue;
                        existingGroup.aValues[index].nQuantity += group.nQuantity;
                    } else {
                        existingEntry.aArticleGroup.push({
                            sName: group.sName,
                            aValues: Array.from({ length: aStatisticResponse.length }, (_, i) => ({
                                nTotalRevenue: i === index ? group.nTotalRevenue : 0,
                                nQuantity: i === index ? group.nQuantity : 0,
                            })),
                        });
                    }
                });
            }
        }

        for (let i = 0; i < aStatisticResponse?.length; i++) {
            const oStatisticResponse = aStatisticResponse[i].individual;
            oStatisticResponse.forEach((oIndividual: any, index: number) => processIndividual(oIndividual, i));
        }

        let aFinalResponse = [...oProcessedArray.values()]
        // console.log('------Final aFinalResponse------', aFinalResponse);
        aFinalResponse.sort((a, b) => (a.sBusinessPartnerName > b.sBusinessPartnerName) ? 1 : ((b.sBusinessPartnerName > a.sBusinessPartnerName) ? -1 : 0))
        aFinalResponse = aFinalResponse.map((oFinalResponse: any) => {
            oFinalResponse?.aArticleGroup?.sort((a: any, b: any) => (a.sName > b.sName) ? 1 : ((b.sName > a.sName) ? -1 : 0))

            /* To show sum of total quantity for specific period */
            oFinalResponse?.aValues?.forEach((element: any, i: number) => {
                aCompareData[i].nTotalQuantity += element?.nQuantity
                aCompareData[i].nTotalRevenue += element?.nTotalRevenue
            });

            return oFinalResponse;
        })
        // console.log('------Final aFinalResponse------ 111', aFinalResponse);

        return aFinalResponse;
    }

}
