import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';

export default function UIDemo() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  // Input states
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | undefined>(undefined);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  const openModal = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full') => {
    setModalSize(size);
    setIsModalOpen(true);
  };

  return (
    <main className="px-6 py-12 bg-[#f7f9fb] min-h-screen">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Base UI Components Demo</h1>
          <p className="mt-2 text-sm text-gray-500">
            A interactive showcase of the custom reusable UI components built for Cruise3D.
          </p>
        </div>

        {/* Buttons Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Button Component</h2>
            <p className="text-xs text-gray-500 mt-1">Supports multiple variants, sizes, icon combinations, and loading states.</p>
          </div>

          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small Button</Button>
                <Button size="md">Medium Button</Button>
                <Button size="lg">Large Button</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button icon="add" variant="primary">Add Item</Button>
                <Button icon="shopping_cart" variant="secondary" iconPosition="right">Checkout</Button>
                <Button icon="delete" variant="danger" size="sm">Delete</Button>
                <Button icon="arrow_forward" variant="outline" iconPosition="right">Next Step</Button>
              </div>
            </div>

            {/* Loading & Disabled States */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" isLoading>Loading State</Button>
                <Button variant="outline" isLoading>Loading State</Button>
                <Button variant="primary" disabled>Disabled State</Button>
                <Button variant="outline" disabled>Disabled State</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Input Component</h2>
            <p className="text-xs text-gray-500 mt-1">Supports labels, icons, error states, and helper text.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Standard Input"
              placeholder="Enter some text..."
              helperText="This is a helper message."
            />

            <Input
              label="Input with Error State"
              placeholder="Invalid entry..."
              error="This field is required and must be a valid email."
            />

            <Input
              label="With Left Icon"
              placeholder="Search products..."
              icon="search"
              iconPosition="left"
            />

            <Input
              label="With Right Icon"
              placeholder="Enter price..."
              icon="payments"
              iconPosition="right"
            />

            <Input
              label="Disabled Input"
              placeholder="Cannot edit this..."
              disabled
              icon="lock"
            />

            <div className="space-y-4">
              <Input
                label="Interactive Field Validation"
                placeholder="Type 'error' to trigger error state..."
                value={inputValue}
                error={inputError}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValue(val);
                  if (val.toLowerCase() === 'error') {
                    setInputError("You typed 'error'!");
                  } else {
                    setInputError(undefined);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Spinners Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Spinner Component</h2>
            <p className="text-xs text-gray-500 mt-1">Smooth SVG animation with sizing and color variants.</p>
          </div>

          <div className="flex flex-wrap gap-8 items-center">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sizes</h3>
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Variants</h3>
              <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl">
                <Spinner variant="white" size="md" />
                <span className="text-white text-xs font-mono">White (dark background)</span>
              </div>
              <div className="flex items-center gap-4">
                <Spinner variant="primary" size="md" />
                <Spinner variant="secondary" size="md" />
                <Spinner variant="gray" size="md" />
              </div>
            </div>
          </div>
        </section>

        {/* Pagination Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Pagination Component</h2>
            <p className="text-xs text-gray-500 mt-1">Fully dynamic sibling ranges, custom sibling counts, and click navigation.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Current Active Page: <span className="font-bold text-blue-600">{currentPage}</span></span>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Large Page Set (100 total pages)</p>
              <Pagination
                currentPage={currentPage}
                totalPages={100}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </section>

        {/* Modals Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Modal Component</h2>
            <p className="text-xs text-gray-500 mt-1">Supports title, body, footer, sizes, escape close, and outside click overlay dismiss.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => openModal('sm')}>Open Small Modal</Button>
            <Button onClick={() => openModal('md')} variant="secondary">Open Medium Modal</Button>
            <Button onClick={() => openModal('lg')} variant="outline">Open Large Modal</Button>
            <Button onClick={() => openModal('xl')} variant="outline">Open Extra Large Modal</Button>
            <Button onClick={() => openModal('full')} variant="danger">Open Full Screen Modal</Button>
          </div>
        </section>
      </div>

      {/* Reusable Modal instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size={modalSize}
        title={`Demo Modal (${modalSize.toUpperCase()})`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm Action</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="leading-relaxed">
            This modal features keyboard accessibility (try pressing <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs font-mono font-bold">Esc</kbd> key to close), scroll locking on the body document element, and smooth entrance scale and fade transitions.
          </p>
          <div className="p-4 bg-blue-50/50 text-blue-700 rounded-lg text-xs leading-relaxed flex gap-2">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <span>You can click outside the modal box boundary to automatically trigger dismiss.</span>
          </div>
        </div>
      </Modal>
    </main>
  );
}
