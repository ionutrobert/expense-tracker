'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [newExpense, setNewExpense] = useState({ date: '', category: '', amount: '' })
  const [newCategory, setNewCategory] = useState('')
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [currency, setCurrency] = useState('EUR')

  const addExpense = (e) => {
    e.preventDefault()
    if (newExpense.date && newExpense.category && newExpense.amount) {
      setExpenses([...expenses, { ...newExpense, id: Date.now() }].sort((a, b) => new Date(b.date) - new Date(a.date)))
      setNewExpense({ date: '', category: '', amount: '' })
    }
  }

  const addCategory = (e) => {
    e.preventDefault()
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory('')
    }
  }

  const updateExpense = (id, updatedExpense) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    ).sort((a, b) => new Date(b.date) - new Date(a.date)))
    setEditingExpense(null)
  }

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const updateCategory = (oldCategory, newCategory) => {
    setCategories(categories.map(cat => cat === oldCategory ? newCategory : cat))
    setExpenses(expenses.map(expense => 
      expense.category === oldCategory ? { ...expense, category: newCategory } : expense
    ))
    setEditingCategory(null)
  }

  const deleteCategory = (category) => {
    setCategories(categories.filter(cat => cat !== category))
    setExpenses(expenses.filter(expense => expense.category !== category))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Expense Tracker</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Add Expense</h2>
            <form onSubmit={addExpense} className="space-y-2">
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full p-2 bg-gray-800 rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                placeholder="Amount"
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
              <button type="submit" className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700">
                Add Expense
              </button>
            </form>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-2">Add Category</h2>
            <form onSubmit={addCategory} className="space-y-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className="w-full p-2 bg-gray-800 rounded"
                required
              />
              <button type="submit" className="w-full p-2 bg-green-600 rounded hover:bg-green-700">
                Add Category
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Expenses</h2>
          <ul className="space-y-2">
            {expenses.map(expense => (
              <li key={expense.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                {editingExpense === expense.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    updateExpense(expense.id, editingExpense)
                  }} className="flex-1 flex space-x-2">
                    <input
                      type="date"
                      value={editingExpense.date}
                      onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                      className="flex-1 p-1 bg-gray-700 rounded"
                    />
                    <select
                      value={editingExpense.category}
                      onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                      className="flex-1 p-1 bg-gray-700 rounded"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                      className="flex-1 p-1 bg-gray-700 rounded"
                    />
                    <button type="submit" className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                      Save
                    </button>
                  </form>
                ) : (
                  <>
                    <span>{expense.date} - {expense.category} - {currency} {expense.amount}</span>
                    <div>
                      <button onClick={() => setEditingExpense({...expense})} className="p-1 text-blue-400 hover:text-blue-300">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteExpense(expense.id)} className="p-1 text-red-400 hover:text-red-300">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Categories</h2>
          <ul className="space-y-2">
            {categories.map(category => (
              <li key={category} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                {editingCategory === category ? (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    updateCategory(category, editingCategory)
                  }} className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value)}
                      className="flex-1 p-1 bg-gray-700 rounded"
                    />
                    <button type="submit" className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                      Save
                    </button>
                  </form>
                ) : (
                  <>
                    <span>{category}</span>
                    <div>
                      <button onClick={() => setEditingCategory(category)} className="p-1 text-blue-400 hover:text-blue-300">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteCategory(category)} className="p-1 text-red-400 hover:text-red-300">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Expense Trend</h2>
          <LineChart width={600} height={300} data={expenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Settings</h2>
          <div className="flex items-center space-x-2">
            <span>Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="p-2 bg-gray-800 rounded"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="RON">RON</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}