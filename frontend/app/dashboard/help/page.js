'use client';

export default function HelpPage() {
  return (
    <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Register an Item</h2>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Go to "Register Item" from the sidebar</li>
              <li>Select the device type (phone, laptop, vehicle, etc.)</li>
              <li>Fill in the required information</li>
              <li>Submit the form to generate a verification code</li>
              <li>Save the verification code and QR code for your records</li>
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Managing Your Items</h2>
            <p className="text-gray-600">
              You can update the status of your items at any time. If your item is lost or stolen,
              change the status so others can help find it. You can also delete items if needed.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Verification Process</h2>
            <p className="text-gray-600">
              When someone finds your item, they can use the verification code to confirm ownership.
              You can also verify items yourself using the "Verify Item" page.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Support</h2>
            <p className="text-gray-600">
              If you need further assistance, please contact our support team at support@lostfound.com
            </p>
          </section>
        </div>
      </div>
  );
}
