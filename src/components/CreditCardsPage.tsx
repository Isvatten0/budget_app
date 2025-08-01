import React, { useState, useEffect } from 'react'
import { CreditCard, Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface CreditCard {
  id: string
  user_id: string
  name: string
  card_number: string
  credit_limit: number
  current_balance: number
  due_date: string
  interest_rate: number
  created_at: string
}

interface CreditCardTransaction {
  id: string
  credit_card_id: string
  user_id: string
  description: string
  amount: number
  date: string
  category: string
  created_at: string
}

interface CreditCardPayment {
  id: string
  credit_card_id: string
  user_id: string
  amount: number
  payment_date: string
  created_at: string
}

const CreditCardsPage: React.FC = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [transactions, setTransactions] = useState<CreditCardTransaction[]>([])
  const [payments, setPayments] = useState<CreditCardPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [showCardNumbers, setShowCardNumbers] = useState(false)

  // Form states
  const [cardForm, setCardForm] = useState({
    name: '',
    card_number: '',
    credit_limit: '',
    due_date: '',
    interest_rate: ''
  })

  const [transactionForm, setTransactionForm] = useState({
    credit_card_id: '',
    description: '',
    amount: '',
    date: '',
    category: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    credit_card_id: '',
    amount: '',
    payment_date: ''
  })

  useEffect(() => {
    loadCreditCards()
  }, [])

  const loadCreditCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [cardsResponse, transactionsResponse, paymentsResponse] = await Promise.all([
        supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('credit_card_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('credit_card_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })
      ])

      if (cardsResponse.data) setCreditCards(cardsResponse.data)
      if (transactionsResponse.data) setTransactions(transactionsResponse.data)
      if (paymentsResponse.data) setPayments(paymentsResponse.data)
    } catch (error) {
      console.error('Error loading credit cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          name: cardForm.name,
          card_number: cardForm.card_number,
          credit_limit: parseFloat(cardForm.credit_limit),
          current_balance: 0,
          due_date: cardForm.due_date,
          interest_rate: parseFloat(cardForm.interest_rate)
        })

      if (error) throw error

      setCardForm({ name: '', card_number: '', credit_limit: '', due_date: '', interest_rate: '' })
      setShowAddCard(false)
      loadCreditCards()
    } catch (error) {
      console.error('Error adding credit card:', error)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('credit_card_transactions')
        .insert({
          user_id: user.id,
          credit_card_id: transactionForm.credit_card_id,
          description: transactionForm.description,
          amount: parseFloat(transactionForm.amount),
          date: transactionForm.date,
          category: transactionForm.category
        })

      if (error) throw error

      // Update card balance
      const card = creditCards.find(c => c.id === transactionForm.credit_card_id)
      if (card) {
        await supabase
          .from('credit_cards')
          .update({ current_balance: card.current_balance + parseFloat(transactionForm.amount) })
          .eq('id', card.id)
      }

      setTransactionForm({ credit_card_id: '', description: '', amount: '', date: '', category: '' })
      setShowAddTransaction(false)
      loadCreditCards()
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('credit_card_payments')
        .insert({
          user_id: user.id,
          credit_card_id: paymentForm.credit_card_id,
          amount: parseFloat(paymentForm.amount),
          payment_date: paymentForm.payment_date
        })

      if (error) throw error

      // Update card balance
      const card = creditCards.find(c => c.id === paymentForm.credit_card_id)
      if (card) {
        await supabase
          .from('credit_cards')
          .update({ current_balance: card.current_balance - parseFloat(paymentForm.amount) })
          .eq('id', card.id)
      }

      setPaymentForm({ credit_card_id: '', amount: '', payment_date: '' })
      setShowAddPayment(false)
      loadCreditCards()
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*')
  }

  const getCardUtilization = (card: CreditCard) => {
    return (card.current_balance / card.credit_limit) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-pine-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-rose-pine-text">Loading credit cards...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-pine-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="game-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <CreditCard className="w-8 h-8 text-rose-pine-gold" />
              <h1 className="text-3xl font-bold text-rose-pine-text">Credit Cards</h1>
            </div>
            <button
              onClick={() => setShowAddCard(true)}
              className="pixel-button flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
          <p className="text-rose-pine-muted">
            Manage your credit cards, track transactions, and monitor payments
          </p>
        </div>

        {/* Credit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {creditCards.map((card) => {
            const utilization = getCardUtilization(card)
            const cardTransactions = transactions.filter(t => t.credit_card_id === card.id)
            const cardPayments = payments.filter(p => p.credit_card_id === card.id)
            
            return (
              <div key={card.id} className="game-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-rose-pine-text">{card.name}</h3>
                  <button
                    onClick={() => setShowCardNumbers(!showCardNumbers)}
                    className="text-rose-pine-muted hover:text-rose-pine-text"
                  >
                    {showCardNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Card Number: </span>
                    <span className="text-rose-pine-text font-mono">
                      {showCardNumbers ? card.card_number : maskCardNumber(card.card_number)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Credit Limit: </span>
                    <span className="text-rose-pine-text">{formatCurrency(card.credit_limit)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Current Balance: </span>
                    <span className="text-rose-pine-text">{formatCurrency(card.current_balance)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Available Credit: </span>
                    <span className="text-rose-pine-text">
                      {formatCurrency(card.credit_limit - card.current_balance)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Utilization: </span>
                    <span className={`font-semibold ${
                      utilization > 80 ? 'text-rose-pine-love' : 
                      utilization > 60 ? 'text-rose-pine-gold' : 'text-rose-pine-pine'
                    }`}>
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Due Date: </span>
                    <span className="text-rose-pine-text">{formatDate(card.due_date)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Interest Rate: </span>
                    <span className="text-rose-pine-text">{card.interest_rate}%</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCard(card)
                      setTransactionForm({ ...transactionForm, credit_card_id: card.id })
                      setShowAddTransaction(true)
                    }}
                    className="pixel-button-secondary flex-1 text-sm"
                  >
                    Add Transaction
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card)
                      setPaymentForm({ ...paymentForm, credit_card_id: card.id })
                      setShowAddPayment(true)
                    }}
                    className="pixel-button-secondary flex-1 text-sm"
                  >
                    Make Payment
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="game-card p-6 mb-6">
            <h2 className="text-xl font-bold text-rose-pine-text mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => {
                const card = creditCards.find(c => c.id === transaction.credit_card_id)
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-rose-pine-overlay rounded">
                    <div>
                      <div className="font-semibold text-rose-pine-text">{transaction.description}</div>
                      <div className="text-sm text-rose-pine-muted">
                        {card?.name} • {formatDate(transaction.date)} • {transaction.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-rose-pine-love">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Payments */}
        {payments.length > 0 && (
          <div className="game-card p-6">
            <h2 className="text-xl font-bold text-rose-pine-text mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {payments.slice(0, 10).map((payment) => {
                const card = creditCards.find(c => c.id === payment.credit_card_id)
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-rose-pine-overlay rounded">
                    <div>
                      <div className="font-semibold text-rose-pine-text">Payment to {card?.name}</div>
                      <div className="text-sm text-rose-pine-muted">
                        {formatDate(payment.payment_date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-rose-pine-pine">
                        -{formatCurrency(payment.amount)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="game-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-rose-pine-text mb-4">Add Credit Card</h2>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Card Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="e.g., Chase Sapphire"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardForm.card_number}
                    onChange={(e) => setCardForm({ ...cardForm, card_number: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cardForm.credit_limit}
                    onChange={(e) => setCardForm({ ...cardForm, credit_limit: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="5000.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={cardForm.due_date}
                    onChange={(e) => setCardForm({ ...cardForm, due_date: e.target.value })}
                    className="pixel-input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cardForm.interest_rate}
                    onChange={(e) => setCardForm({ ...cardForm, interest_rate: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="18.99"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="pixel-button flex-1"
                  >
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="pixel-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="game-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-rose-pine-text mb-4">Add Transaction</h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="e.g., Grocery store purchase"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="25.50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className="pixel-input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                    className="pixel-select w-full"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="food">Food & Dining</option>
                    <option value="transportation">Transportation</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="pixel-button flex-1"
                  >
                    Add Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTransaction(false)}
                    className="pixel-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showAddPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="game-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-rose-pine-text mb-4">Make Payment</h2>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="100.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="pixel-input w-full"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="pixel-button flex-1"
                  >
                    Make Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="pixel-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreditCardsPage