import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";

export default function PaymentsPage() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Top accent */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Payments & Fees</h1>
              <p className="text-sm text-slate-500">
                Manage your tuition and course payments
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center font-semibold text-sm">
              AK
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Outstanding Balance Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Outstanding Balance
                </p>
                <p className="text-4xl font-bold text-acosat-red mt-1">$240.00</p>
                <p className="text-sm text-slate-500 mt-1">Due by 28 August 2026</p>
              </div>
              <button className="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-700/20 transition">
                Pay Now
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Payment History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">Date</th>
                    <th className="text-left font-medium px-4 py-3">Description</th>
                    <th className="text-left font-medium px-4 py-3">Amount</th>
                    <th className="text-left font-medium px-4 py-3">Method</th>
                    <th className="text-left font-medium px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3">10 Aug 2026</td>
                    <td className="px-4 py-3">Tuition – Fall 2026 (Partial)</td>
                    <td className="px-4 py-3 font-medium">$480.00</td>
                    <td className="px-4 py-3">Mobile Money</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3">02 Jul 2026</td>
                    <td className="px-4 py-3">Registration Fee</td>
                    <td className="px-4 py-3 font-medium">$50.00</td>
                    <td className="px-4 py-3">Card</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3">15 Jan 2026</td>
                    <td className="px-4 py-3">Tuition – Spring 2026</td>
                    <td className="px-4 py-3 font-medium">$720.00</td>
                    <td className="px-4 py-3">Bank Transfer</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3">10 Sep 2025</td>
                    <td className="px-4 py-3">Tuition – Fall 2025</td>
                    <td className="px-4 py-3 font-medium">$720.00</td>
                    <td className="px-4 py-3">Mobile Money</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Help Note */}
          <div className="mt-6 bg-navy-50 border border-navy-100 rounded-2xl p-5">
            <h3 className="font-semibold text-navy-800 mb-1">Need help with payments?</h3>
            <p className="text-sm text-navy-700">
              Contact the Finance Office at{" "}
              <span className="font-medium">finance@acosat.edu</span> or visit the
              campus office during working hours.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}