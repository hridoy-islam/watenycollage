export function ProfessionalInvoice() {
  return (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600">#4578</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-900">Aesome</h2>
          <p className="text-gray-600">123 Company St, Suite 100</p>
          <p className="text-gray-600">Business City, 54321</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-gray-600 font-semibold">Bill To:</h3>
          <p className="font-medium text-gray-900">Ridoy</p>
          <p className="text-gray-600">Dhaka</p>
          <p className="text-gray-600">hridy@gmail.com</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">
            <span className="font-semibold">Invoice Date:</span> 19-02-3023
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Due Date:</span> 19-02-3023
          </p>
        </div>
      </div>

      <table className="mt-8 w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 text-left text-gray-600">Description</th>
            <th className="py-2 text-right text-gray-600">Quantity</th>
            <th className="py-2 text-right text-gray-600">Unit Price</th>
            <th className="py-2 text-right text-gray-600">Amount</th>
          </tr>
        </thead>
        <tbody>
           {/* loop */}
            <tr   className="border-b border-gray-200">
              <td className="py-4 text-gray-900">description</td>
              <td className="py-4 text-right text-gray-900">5</td>
              <td className="py-4 text-right text-gray-900">£10</td>
              <td className="py-4 text-right text-gray-900">£50</td>
            </tr>
         
        </tbody>
      </table>

      <div className="mt-8 flex justify-end">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Subtotal:</span>
            <span className="text-gray-900">£200</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Tax:</span>
            <span className="text-gray-900">£600</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Discount:</span>
            <span className="text-gray-900">£300</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-semibold text-gray-900">£500.00</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-gray-600">Notes:</h3>
        <p className="text-gray-600">notes</p>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}

