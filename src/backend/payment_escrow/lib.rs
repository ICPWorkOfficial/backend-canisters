use candid::{CandidType, Principal};
use ic_cdk::{caller, api::time};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static PAYMENTS: RefCell<HashMap<u64, Payment>> = RefCell::new(HashMap::new());
    static NEXT_PAYMENT_ID: RefCell<u64> = RefCell::new(1);
}

#[derive(CandidType, Clone, Debug, PartialEq)]
enum PaymentStatus {
    Pending,
    Escrowed,
    Released,
    Refunded,
    Disputed,
}

#[derive(CandidType, Clone, Debug)]
struct Payment {
    id: u64,
    project_id: u64,
    client: Principal,
    freelancer: Principal,
    amount: u64,
    status: PaymentStatus,
    created_at: u64,
    updated_at: u64,
}

#[derive(CandidType, Debug)]
enum PaymentError {
    PaymentNotFound,
    UnauthorizedOperation,
    InvalidPaymentStatus,
    AmountTooLow,
}

type PaymentResult = Result<Payment, PaymentError>;

#[ic_cdk_macros::update]
fn create_payment(project_id: u64, freelancer: Principal, amount: u64) -> PaymentResult {
    let caller = caller();
    
    // Validation
    if amount == 0 {
        return Err(PaymentError::AmountTooLow);
    }
    
    let payment_id = NEXT_PAYMENT_ID.with(|id| {
        let next_id = *id.borrow();
        *id.borrow_mut() = next_id + 1;
        next_id
    });
    
    let now = time() as u64;
    let payment = Payment {
        id: payment_id,
        project_id,
        client: caller,
        freelancer,
        amount,
        status: PaymentStatus::Pending,
        created_at: now,
        updated_at: now,
    };
    
    PAYMENTS.with(|payments| {
        payments.borrow_mut().insert(payment_id, payment.clone());
    });
    
    Ok(payment)
}

#[ic_cdk_macros::update]
fn escrow_payment(payment_id: u64) -> PaymentResult {
    let caller = caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_map = payments.borrow_mut();
        
        if let Some(payment) = payments_map.get(&payment_id) {
            if payment.client != caller {
                return Err(PaymentError::UnauthorizedOperation);
            }
            
            if payment.status != PaymentStatus::Pending {
                return Err(PaymentError::InvalidPaymentStatus);
            }
            
            // In a real scenario, this is where we would handle the token transfer
            // to the escrow account, but for now we'll just update the status
            
            let now = time() as u64;
            let updated_payment = Payment {
                id: payment.id,
                project_id: payment.project_id,
                client: payment.client,
                freelancer: payment.freelancer,
                amount: payment.amount,
                status: PaymentStatus::Escrowed,
                created_at: payment.created_at,
                updated_at: now,
            };
            
            payments_map.insert(payment_id, updated_payment.clone());
            Ok(updated_payment)
        } else {
            Err(PaymentError::PaymentNotFound)
        }
    })
}

#[ic_cdk_macros::update]
fn release_payment(payment_id: u64) -> PaymentResult {
    let caller = caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_map = payments.borrow_mut();
        
        if let Some(payment) = payments_map.get(&payment_id) {
            if payment.client != caller {
                return Err(PaymentError::UnauthorizedOperation);
            }
            
            if payment.status != PaymentStatus::Escrowed {
                return Err(PaymentError::InvalidPaymentStatus);
            }
            
            // In a real scenario, this is where we would release the tokens 
            // to the freelancer, but for now we'll just update the status
            
            let now = time() as u64;
            let updated_payment = Payment {
                id: payment.id,
                project_id: payment.project_id,
                client: payment.client,
                freelancer: payment.freelancer,
                amount: payment.amount,
                status: PaymentStatus::Released,
                created_at: payment.created_at,
                updated_at: now,
            };
            
            payments_map.insert(payment_id, updated_payment.clone());
            Ok(updated_payment)
        } else {
            Err(PaymentError::PaymentNotFound)
        }
    })
}

#[ic_cdk_macros::update]
fn refund_payment(payment_id: u64) -> PaymentResult {
    let caller = caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_map = payments.borrow_mut();
        
        if let Some(payment) = payments_map.get(&payment_id) {
            if payment.client != caller {
                return Err(PaymentError::UnauthorizedOperation);
            }
            
            if payment.status != PaymentStatus::Escrowed {
                return Err(PaymentError::InvalidPaymentStatus);
            }
            
            // In a real scenario, this is where we would refund the tokens 
            // to the client, but for now we'll just update the status
            
            let now = time() as u64;
            let updated_payment = Payment {
                id: payment.id,
                project_id: payment.project_id,
                client: payment.client,
                freelancer: payment.freelancer,
                amount: payment.amount,
                status: PaymentStatus::Refunded,
                created_at: payment.created_at,
                updated_at: now,
            };
            
            payments_map.insert(payment_id, updated_payment.clone());
            Ok(updated_payment)
        } else {
            Err(PaymentError::PaymentNotFound)
        }
    })
}

#[ic_cdk_macros::query]
fn get_payment(payment_id: u64) -> Result<Payment, PaymentError> {
    PAYMENTS.with(|payments| {
        payments.borrow().get(&payment_id)
            .cloned()
            .ok_or(PaymentError::PaymentNotFound)
    })
}

#[ic_cdk_macros::query]
fn get_client_payments(client: Principal) -> Vec<Payment> {
    PAYMENTS.with(|payments| {
        payments.borrow().values()
            .filter(|payment| payment.client == client)
            .cloned()
            .collect()
    })
}

#[ic_cdk_macros::query]
fn get_freelancer_payments(freelancer: Principal) -> Vec<Payment> {
    PAYMENTS.with(|payments| {
        payments.borrow().values()
            .filter(|payment| payment.freelancer == freelancer)
            .cloned()
            .collect()
    })
}

#[ic_cdk_macros::query]
fn get_project_payments(project_id: u64) -> Vec<Payment> {
    PAYMENTS.with(|payments| {
        payments.borrow().values()
            .filter(|payment| payment.project_id == project_id)
            .cloned()
            .collect()
    })
}

// Export Candid interface
candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
