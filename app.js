//Budget controller
var budgetController = (function () {
    //Expense Constructor function
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    //get percentage
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    //Income Constructor function
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //creating new ID
            if(!Array.isArray(data.allItems[type]) || !data.allItems[type].length) {
                ID = 0;
            }else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            //create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our arrays
            data.allItems[type].push(newItem);

            //return new item
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;

            //transforming and return all IDs
            ids = data.allItems[type].map(function(current) {
                return current.id
            });

            //getting the position of the item to remove
            index = ids.indexOf(id);
            
            //remove the item
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },
        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });

            return allPercentages;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testting: function() {
            console.log(data);
        }
    }

})();

//UI controller
var UIController = (function () {
    var stringObj = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLable: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = parseFloat(numSplit[0]);
        // if(int.length > 3) {
        //     int = int.substr(0, int.length - 3) + ', ' + int.substr(int.length - 3, 3);
        // }

        int = int.toLocaleString();
    
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    //creating our foreach function
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(stringObj.inputType).value, //will be either inc(+) or exp(-)
                description: document.querySelector(stringObj.inputDescription).value,
                value: parseFloat(document.querySelector(stringObj.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create HTML string with placeholder text
            if(type === 'inc') {
                element = stringObj.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else {
                element = stringObj.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replacing the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);

        },
        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(stringObj.inputDescription + ', ' + stringObj.inputValue);

            //converting fields list into array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },
        displayBudget: function(obj) {
            var type;

            type = obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(stringObj.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(stringObj.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(stringObj.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(stringObj.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(stringObj.percentageLabel).textContent = '---';
            }
            
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(stringObj.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }

            });
        },
        displayMonth: function() {
            var now, year, month, months;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            month = months[now.getMonth()];
            year = now.getFullYear();

            document.querySelector(stringObj.dateLable).textContent = month + ' ' + year;

        },
        changedType: function() {
            var fields = document.querySelectorAll(
                stringObj.inputType + ', ' + 
                stringObj.inputDescription + ', ' +
                stringObj.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(stringObj.inputBtn).classList.toggle('red');


        },
        getStringObj: function() {
            return stringObj;
        }
    }
})();

//Global controller
var controller = (function (budgetCtrl, UICtrl) {
    var evtListeners = function() {
        var dom = UICtrl.getStringObj();

        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);  

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        //event delegation for removing an item
        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(dom.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        //calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        var budget = budgetCtrl.getBudget();

        //display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //calculate percentages
        budgetCtrl.calculatePercentages();

        //Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        //get the input data object
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add the item to the UI controller
            UICtrl.addListItem(newItem, input.type);

            //clear the fields
            UICtrl.clearFields();

            //calculate and update budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //update and show the new budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            evtListeners();
        }
    }

})(budgetController, UIController);

controller.init();
