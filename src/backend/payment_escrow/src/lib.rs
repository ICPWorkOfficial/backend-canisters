use candid::{CandidType, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;
use serde_derive::{Serialize, Deserialize as SerdeDeserialize};

type PaymentId = u64;
type ProjectId = u64;

#[derive(CandidType, Clone, Debug, PartialEq, SerdeDeserialize, Serialize)]
enum PaymentStatus {
    Pending,
    Escrowed,
    Released,
    Refunded,
    Disputed,
}

#[derive(CandidType, Clone, Debug, SerdeDeserialize, Serialize)]
struct Payment {
    id: PaymentId,
    client_id: Principal,
    freelancer_id: Principal,
    project_id: ProjectId,
    amount: u64,
    status: PaymentStatus,
    created_at: u64,
    updated_at: u64,
}

#[derive(CandidType, Debug)]
enum PaymentError {
    NotFound,
    AlreadyExists,
    Unauthorized,
    InvalidStatus,
    OperationFailed,
}

type PaymentResult = Result<Payment, PaymentError>;

thread_local! {
    static PAYMENTS: RefCell<HashMap<PaymentId, Payment>> = RefCell::new(HashMap::new());
    static NEXT_PAYMENT_ID: RefCell<PaymentId> = RefCell::new(1);
}

#[update]
fn create_escrow(project_id: ProjectId, freelancer_id: Principal, amount: u64) -> PaymentResult {
    let caller = ic_cdk::caller();
    let payment_id = NEXT_PAYMENT_ID.with(|id| {
        let current_id = *id.borrow();
        *id.borrow_mut() = current_id + 1;
        current_id
    });
    
    let now = time();
    let payment = Payment {
        id: payment_id,
        client_id: caller,
        freelancer_id,
        project_id,
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

#[update]
fn deposit_to_escrow(payment_id: PaymentId) -> PaymentResult {
    let caller = ic_cdk::caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_mut = payments.borrow_mut();
        
        if let Some(payment) = payments_mut.get_mut(&payment_id) {
            if payment.client_id != caller {
                return Err(PaymentError::Unauthorized);
            }
            
            if payment.status != PaymentStatus::Pending {
                return Err(PaymentError::InvalidStatus);
            }
            
            payment.status = PaymentStatus::Escrowed;
            payment.updated_at = time();
            
            Ok(payment.clone())
        } else {
            Err(PaymentError::NotFound)
        }
    })
}

#[update]
fn release_payment(payment_id: PaymentId) -> PaymentResult {
    let caller = ic_cdk::caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_mut = payments.borrow_mut();
        
        if let Some(payment) = payments_mut.get_mut(&payment_id) {
            if payment.client_id != caller {
                return Err(PaymentError::Unauthorized);
            }
            
            if payment.status != PaymentStatus::Escrowed {
                return Err(PaymentError::InvalidStatus);
            }
            
            payment.status = PaymentStatus::Released;
            payment.updated_at = time();
            
            Ok(payment.clone())
        } else {
            Err(PaymentError::NotFound)
        }
    })
}

#[update]
fn refund_payment(payment_id: PaymentId) -> PaymentResult {
    let caller = ic_cdk::caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_mut = payments.borrow_mut();
        
        if let Some(payment) = payments_mut.get_mut(&payment_id) {
            if payment.client_id != caller {
                return Err(PaymentError::Unauthorized);
            }
            
            if payment.status != PaymentStatus::Escrowed {
                return Err(PaymentError::InvalidStatus);
            }
            
            payment.status = PaymentStatus::Refunded;
            payment.updated_at = time();
            
            Ok(payment.clone())
        } else {
            Err(PaymentError::NotFound)
        }
    })
}

#[update]
fn dispute_payment(payment_id: PaymentId) -> PaymentResult {
    let caller = ic_cdk::caller();
    
    PAYMENTS.with(|payments| {
        let mut payments_mut = payments.borrow_mut();
        
        if let Some(payment) = payments_mut.get_mut(&payment_id) {
            if payment.client_id != caller && payment.freelancer_id != caller {
                return Err(PaymentError::Unauthorized);
            }
            
            if payment.status != PaymentStatus::Escrowed {
                return Err(PaymentError::InvalidStatus);
            }
            
            payment.status = PaymentStatus::Disputed;
            payment.updated_at = time();
            
            Ok(payment.clone())
        } else {
            Err(PaymentError::NotFound)
        }
    })
}

#[query]
fn get_payment(payment_id: PaymentId) -> PaymentResult {
    PAYMENTS.with(|payments| {
        payments.borrow().get(&payment_id)
            .map(|payment| payment.clone())
            .ok_or(PaymentError::NotFound)
    })
}

#[query]
fn get_client_payments(client_id: Principal) -> Vec<Payment> {
    PAYMENTS.with(|payments| {
        payments.borrow().values()
            .filter(|payment| payment.client_id == client_id)
            .cloned()
            .collect()
    })
}

#[query]
fn get_freelancer_payments(freelancer_id: Principal) -> Vec<Payment> {
    PAYMENTS.with(|payments| {
        payments.borrow().values()
            .filter(|payment| payment.freelancer_id == freelancer_id)
            .cloned()
            .collect()
    })
}

#[query]
fn get_project_payments(project_id: ProjectId) -> Vec<Payment> {
    PAYMENTS.with(|payments| {
        payments.borrow().values()
            .filter(|payment| payment.project_id == project_id)
            .cloned()
            .collect()
    })
}

// Export the Candid interface using the newer format
candid::export_service!();

// This is required for export_service! to work correctly
#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
