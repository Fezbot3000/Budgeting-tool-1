let bills=[],payFrequency='',payCycles=3,income=0;

function goToStep2(){
    payFrequency=document.getElementById('frequency').value;
    income=parseFloat(document.getElementById('income').value);
    const payday=document.getElementById('payday').value;
    let yearlyIncome;
    if(payFrequency==='fortnightly')yearlyIncome=income*26;
    else if(payFrequency==='weekly')yearlyIncome=income*52;
    else if(payFrequency==='monthly')yearlyIncome=income*12;
    const incomeTable=document.getElementById('incomeTable');
    incomeTable.innerHTML+=`<tr><td>${payFrequency}</td><td>$${income.toFixed(2)}</td><td>${payday}</td><td>$${yearlyIncome.toFixed(2)}</td></tr>`;
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    updateAccordion();
}

document.getElementById('billsForm').addEventListener('submit',function(event){
    event.preventDefault();
    const billIndex=document.getElementById('billIndex').value,
          billName=document.getElementById('billName').value,
          billAmount=parseFloat(document.getElementById('billAmount').value),
          billFrequency=document.getElementById('billFrequency').value,
          billDate=document.getElementById('billDate').value;
    if(billIndex==='')bills.push({name:billName,amount:billAmount,frequency:billFrequency,date:billDate});
    else bills[billIndex]={name:billName,amount:billAmount,frequency:billFrequency,date:billDate};
    updateBillsTable();updateAccordion();resetBillForm();
});

function updateBillsTable(){
    const billsTable=document.getElementById('billsTable');
    let totalYearlyAmount=0;
    billsTable.innerHTML=`<tr><th>Bill Name</th><th>Bill Amount</th><th>Bill Frequency</th><th>Next Due Date</th><th>12-Monthly Total Amount</th><th>Actions</th></tr>`;
    bills.forEach((bill,index)=>{
        const yearlyAmount=calculateYearlyAmount(bill.amount,bill.frequency);
        totalYearlyAmount+=yearlyAmount;
        billsTable.innerHTML+=`<tr><td>${bill.name}</td><td class="bills negative">-$${bill.amount.toFixed(2)}</td><td>${bill.frequency}</td><td>${bill.date}</td><td>-$${yearlyAmount.toFixed(2)}</td><td><button class="edit-btn" onclick="editBill(${index})">Edit</button></td></tr>`;
    });
    const totalRow=document.createElement('tr');
    totalRow.innerHTML=`<td colspan="4"><strong>Total Yearly Amount:</strong></td><td><strong>-$${totalYearlyAmount.toFixed(2)}</strong></td><td></td>`;
    billsTable.appendChild(totalRow);
}

function calculateYearlyAmount(amount,frequency){
    let multiplier=0;
    switch(frequency){
        case'weekly':multiplier=52;break;
        case'fortnightly':multiplier=26;break;
        case'monthly':multiplier=12;break;
        case'yearly':multiplier=1;break;
    }
    return amount*multiplier;
}

function calculateYearlyBills(){
    let yearlyTotal=0;
    bills.forEach(bill=>{
        yearlyTotal+=calculateYearlyAmount(bill.amount,bill.frequency);
    });
    const yearlyBillsAmountDiv=document.getElementById('yearlyBillsAmount');
    yearlyBillsAmountDiv.innerText=`Total Yearly Bill Amount: $${yearlyTotal.toFixed(2)}`;
}

function removeBill(index){
    bills.splice(index,1);
    updateBillsTable();calculateYearlyBills();
}

function toggleBillList(){
    const billsTable=document.getElementById('billsTable');
    if(billsTable.style.display==='none'){billsTable.style.display='table';}
    else{billsTable.style.display='none';}
}

function editBill(index){
    const bill=bills[index];
    document.getElementById('billIndex').value=index;
    document.getElementById('billName').value=bill.name;
    document.getElementById('billAmount').value=bill.amount;
    document.getElementById('billFrequency').value=bill.frequency;
    document.getElementById('billDate').value=bill.date;
    document.getElementById('submitBill').textContent='Save';
}

function resetBillForm(){
    document.getElementById('billIndex').value='';
    document.getElementById('billName').value='';
    document.getElementById('billAmount').value='';
    document.getElementById('billFrequency').value='';
    document.getElementById('billDate').value='';
    document.getElementById('submitBill').textContent='Add Bill';
}

function updateAccordion(){
    const accordionContainer=document.getElementById('accordionContainer');
    accordionContainer.innerHTML='';
    let currentDate=new Date(document.getElementById('payday').value),cycleLength;
    if(payFrequency==='weekly')cycleLength=7;
    else if(payFrequency==='fortnightly')cycleLength=14;
    else if(payFrequency==='monthly'){
        let tempDate=new Date(currentDate);
        tempDate.setMonth(tempDate.getMonth()+1);
        tempDate.setDate(currentDate.getDate()-1);
        cycleLength=(tempDate-currentDate)/(1000*60*60*24);
    }
    let cycleDates=[];
    for(let i=0;i<payCycles;i++){
        let nextDate=new Date(currentDate);
        nextDate.setDate(nextDate.getDate()+cycleLength);
        cycleDates.push({start:new Date(currentDate),end:new Date(nextDate)});
        currentDate=new Date(nextDate);
        currentDate.setDate(currentDate.getDate()+1);
    }
    let chartData={dates:[],totals:[]};
    cycleDates.forEach((dates,index)=>{
        let cycleTotal=0,cycleBills='';
        bills.forEach(bill=>{
            let billDueDate=new Date(bill.date);
            if(bill.frequency==='yearly'){
                if(billDueDate>=dates.start&&billDueDate<=dates.end){
                    cycleTotal+=bill.amount;
                    cycleBills+=`<tr><td>${bill.name}</td><td>${billDueDate.toDateString()}</td><td class="bills negative">-$${bill.amount.toFixed(2)}</td></tr>`;
                }
            }else{
                while(billDueDate<=dates.end){
                    if(billDueDate>=dates.start&&billDueDate<=dates.end){
                        cycleTotal+=bill.amount;
                        cycleBills+=`<tr><td>${bill.name}</td><td>${billDueDate.toDateString()}</td><td class="bills negative">-$${bill.amount.toFixed(2)}</td></tr>`;
                    }
                    if(bill.frequency==='weekly'){billDueDate.setDate(billDueDate.getDate()+7);}
                    else if(bill.frequency==='fortnightly'){billDueDate.setDate(billDueDate.getDate()+14);}
                    else if(bill.frequency==='monthly'){billDueDate.setMonth(billDueDate.getMonth()+1);}
                }
            }
        });
        const leftoverAmount=income-cycleTotal;
        accordionContainer.innerHTML+=`<button class="accordion">${dates.start.toDateString()} - ${dates.end.toDateString()}<span class="leftover">Leftover: $${leftoverAmount.toFixed(2)}</span></button><div class="panel"><div class="pay-cycle"><table><tr><td colspan="2">Income:</td><td class="positive">$${income.toFixed(2)}</td></tr><tr><td colspan="2">Total Bills:</td><td class="negative">-$${cycleTotal.toFixed(2)}</td></tr>${cycleBills}</table></div></div>`;
        chartData.dates.push(dates.start.toDateString());
        chartData.totals.push(cycleTotal);
    });
    document.querySelectorAll('.accordion').forEach(button=>{
        button.addEventListener('click',function(){
            this.classList.toggle('active');
            const panel=this.nextElementSibling;
            if(panel.style.display==="block"){panel.style.display="none";}
            else{panel.style.display="block";}
        });
    });
    updateChart(chartData);
}

function loadMorePayCycles(){
    if(payCycles<15){payCycles+=3;updateAccordion();}
}

function updateChart(chartData){
    const ctx=document.getElementById('financialChart').getContext('2d');
    if(window.financialChart&&typeof window.financialChart.destroy==='function'){window.financialChart.destroy();}
    window.financialChart=new Chart(ctx,{type:'bar',data:{labels:chartData.dates,datasets:[{label:'Total Bills',data:chartData.totals,backgroundColor:'rgba(75, 192, 192, 0.2)',borderColor:'rgba(75, 192, 192, 1)',borderWidth:1}]},options:{scales:{x:{beginAtZero:true,type:'category',labels:chartData.dates,ticks:{autoSkip:true,maxTicksLimit:20},title:{display:true,text:'Start Date of Pay Cycle'}},y:{beginAtZero:true,title:{display:true,text:'Total Bills'}}},responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
}