const userId       = 1;
let userName       = "Emelie";
const userEmail    = "eevrard2022@gmail.com";
let userHasAccount = true;

console.log(userId,         typeof userId);
console.log(userName,       typeof userName);
console.log(userEmail,      typeof userEmail);
console.log(userHasAccount, typeof userHasAccount);

const tripId         = 101;
let tripName         = "MLA Conference";
const tripCurrency   = "USD";
let isGroupTrip      = false;
let participantCount = 1;
let endDate;
let tripNotes        = null;

const expenseId        = 1001;
let expenseDescription = "Dinner";
let expenseAmount      = 84.50;
let paidByUser         = "Emelie";
let splitMethod        = "equal";
let isReimbursable     = false;

console.log(`${expenseDescription}: ${expenseAmount} ${tripCurrency}, paid by ${paidByUser}`);

userName      = "Jordan";
expenseAmount = 96.25;
tripName      = "ALA Conference";
SecondTripId  = 102;

let hotelCost = 200;
let taxiCost  = 50;
console.log(hotelCost + taxiCost);

const secondexpenseId        = 1002;
let secondExpenseDescription = "Airfare";
let secondExpenseAmount      = 500.00;
let secondPaidByUser         = "Emelie";
let secondSplitMethod        = "equal";
let secondIsReimbursable     = true;

console.log(`${secondExpenseDescription}: ${secondExpenseAmount} ${tripCurrency}, paid by ${paidByUser}`);

console.log("CURRENT TRIP");
console.log(`User: ${userName}`);
console.log(`Trip: ${tripName}`);
console.log(`Group trip: ${isGroupTrip}`);
console.log(`Participants: ${participantCount}`);
console.log(`Expense: ${expenseDescription} - ${expenseAmount} ${tripCurrency}`);
