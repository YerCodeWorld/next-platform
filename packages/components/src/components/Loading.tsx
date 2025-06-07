// app/loading.js

const GIF = '/images/icons/preloader.gif';

export default function Loading() {
    return (
        <div className='preloader'>
            <img
                src={GIF}
                loading='lazy'
                alt='Loading...'
            />
        </div>
    );
}
