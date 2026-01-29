import ImageUploader from '@/components/upload/ImageUploader';

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        Extract Data from Images
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-500 sm:mt-4">
                        Upload attendance sheets or test results. AI will digitize and structure the data for you to review.
                    </p>
                </div>

                <ImageUploader />
            </div>
        </div>
    );
}
