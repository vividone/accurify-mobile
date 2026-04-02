import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { clientsApi } from '@/services/api/clients.api';
import { projectsApi } from '@/services/api/projects.api';
import { useUIStore } from '@/store/ui.store';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessStore } from '@/store/business.store';
import { markFastPathCompleted } from '@/utils/fast-path.utils';
import { formatCurrency } from '@/utils/currency';

const TOTAL_STEPS = 3;

interface ProjectFastPathWizardProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectFastPathWizard({ open, onClose }: ProjectFastPathWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const business = useBusinessStore((s) => s.business);

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Step 0 — client
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientError, setClientError] = useState('');
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  // Step 1 — project
  const [projectName, setProjectName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [projectErrors, setProjectErrors] = useState<{ name?: string; value?: string }>({});

  const contractNaira = parseFloat(contractValue) || 0;

  const handleClose = () => {
    setCurrentStep(0);
    setShowSuccess(false);
    setCreatedProjectId(null);
    setClientName('');
    setClientEmail('');
    setClientError('');
    setCreatedClientId(null);
    setProjectName('');
    setContractValue('');
    setProjectErrors({});
    onClose();
  };

  const handleClientNext = async () => {
    if (!clientName.trim()) {
      setClientError('Client name is required');
      return;
    }
    setClientError('');
    setIsLoading(true);
    try {
      const client = await clientsApi.create({
        name: clientName.trim(),
        email: clientEmail.trim() || undefined,
      });
      setCreatedClientId(client.id);
      setCurrentStep(1);
    } catch {
      showNotification('Error', 'Failed to create client. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectNext = async () => {
    const errors: { name?: string; value?: string } = {};
    if (!projectName.trim()) errors.name = 'Project name is required';
    if (!contractValue || contractNaira <= 0) errors.value = 'Contract value must be greater than 0';
    if (Object.keys(errors).length > 0) {
      setProjectErrors(errors);
      return;
    }
    setProjectErrors({});
    setIsLoading(true);
    try {
      const project = await projectsApi.create({
        name: projectName.trim(),
        clientId: createdClientId!,
        billingModel: 'FIXED_PRICE',
        contractValue: contractNaira,
      });
      setCreatedProjectId(project.id);
      if (business?.id) markFastPathCompleted(business.id, 'project');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      setShowSuccess(true);
      showNotification('Success', 'Project created successfully', 'success');
    } catch {
      showNotification('Error', 'Failed to create project. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProject = () => {
    handleClose();
    if (createdProjectId) {
      navigate(`/app/projects/${createdProjectId}`);
    } else {
      navigate('/app/projects');
    }
  };

  const inputClass =
    'w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary bg-white';
  const labelClass = 'block text-label-01 text-gray-60 mb-1';
  const errorClass = 'text-helper-01 text-danger mt-1';

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-[60]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-x-0 bottom-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-20 flex items-center justify-between">
                <Dialog.Title className="text-heading-03 text-gray-100">
                  {showSuccess ? 'Project created!' : 'Create your first project'}
                </Dialog.Title>
                <button onClick={handleClose} className="p-1 -mr-1 text-gray-50">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Step dots */}
              {!showSuccess && (
                <div className="flex justify-center gap-2 py-3">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-green-500' : 'bg-gray-20'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="px-5 pb-8">
                {showSuccess ? (
                  /* Success screen */
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-heading-03 text-gray-100 mb-2">Project ready!</h3>
                    <p className="text-body-01 text-gray-50 mb-1">
                      <span className="font-medium">{projectName}</span> for{' '}
                      <span className="font-medium">{clientName}</span>
                    </p>
                    {contractNaira > 0 && (
                      <p className="text-body-01 text-gray-50">
                        Contract value: {formatCurrency(contractNaira * 100)}
                      </p>
                    )}
                    <button
                      onClick={handleViewProject}
                      className="mt-6 w-full h-12 bg-primary text-white rounded-lg font-medium text-body-01"
                    >
                      View Project
                    </button>
                    <button
                      onClick={handleClose}
                      className="mt-3 w-full h-12 text-primary font-medium text-body-01"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                ) : currentStep === 0 ? (
                  /* Step 0: Client */
                  <div className="space-y-4 pt-2">
                    <h3 className="text-heading-04 text-gray-100">Who is the client?</h3>
                    <p className="text-body-01 text-gray-50">Add the client for this project</p>
                    <div>
                      <label className={labelClass}>Client name *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Acme Ltd"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        autoFocus
                      />
                      {clientError && <p className={errorClass}>{clientError}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Email (optional)</label>
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="client@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleClientNext}
                      disabled={isLoading || !clientName.trim()}
                      className="w-full h-12 bg-primary text-white rounded-lg font-medium text-body-01 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Next'}
                    </button>
                  </div>
                ) : currentStep === 1 ? (
                  /* Step 1: Project details */
                  <div className="space-y-4 pt-2">
                    <h3 className="text-heading-04 text-gray-100">Set up your project</h3>
                    <p className="text-body-01 text-gray-50">Define the project scope and value</p>
                    <div>
                      <label className={labelClass}>Project name *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Website Redesign"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        autoFocus
                      />
                      {projectErrors.name && <p className={errorClass}>{projectErrors.name}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Contract value (NGN) *</label>
                      <input
                        className={inputClass}
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 500000"
                        value={contractValue}
                        onChange={(e) => setContractValue(e.target.value)}
                      />
                      {projectErrors.value && <p className={errorClass}>{projectErrors.value}</p>}
                      {contractNaira > 0 && (
                        <p className="text-helper-01 text-gray-40 mt-1">
                          Fixed price: {formatCurrency(contractNaira * 100)}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-05 rounded-lg p-3">
                      <p className="text-helper-01 text-gray-50">
                        Client: <span className="font-medium text-gray-100">{clientName}</span>
                      </p>
                      <p className="text-helper-01 text-gray-50 mt-1">
                        Billing: <span className="font-medium text-gray-100">Fixed Price</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="flex-1 h-12 border border-gray-30 text-gray-60 rounded-lg font-medium text-body-01"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleProjectNext}
                        disabled={isLoading || !projectName.trim() || contractNaira <= 0}
                        className="flex-1 h-12 bg-primary text-white rounded-lg font-medium text-body-01 disabled:opacity-50"
                      >
                        {isLoading ? 'Creating...' : 'Create Project'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
