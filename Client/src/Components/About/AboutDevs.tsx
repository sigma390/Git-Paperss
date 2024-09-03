import pdpf from '../../assets/Pd.jpeg';
import pratham from '../../assets/Pratham.jpg';
import pratik from '../../assets/Pratik.jpeg';
const AboutDevs = () => {
  return (
    <div className='m-10'>
      {/* Heading for About our Developers */}
      <h1 className='text-3xl font-bold mb-6'>About our Developers</h1>

      {/* Grid containing the cards */}
      <div className='grid grid-cols-3 gap-6 mt-10'>
        {/* Card for Pranav Deshpande */}
        <div className='card card-compact w-96 bg-base-100 shadow-2xl'>
          <figure>
            <img
              src={pdpf}
              alt='Pranav Profile Photo'
              className='w-full max-h-72 object-contain'
            />
          </figure>
          <div className='card-body'>
            <h2 className='card-title'>Pranav Deshpande</h2>
            <p>
              Passionate Computer Science Engineer, Currently Working Remotely
            </p>
          </div>
        </div>

        {/* Empty divs for layout */}
        <div className='card card-compact w-96 bg-base-100 shadow-2xl'>
          <figure>
            <img
              src={pratik}
              alt='Pratik Profile Photo'
              className='w-full max-h-72 object-contain'
            />
          </figure>
          <div className='card-body'>
            <h2 className='card-title'>Pratik D</h2>
            <p>Passionate Computer Science Engineer,</p>
          </div>
        </div>
        <div className='card card-compact w-96 bg-base-100 shadow-2xl'>
          <figure>
            <img
              src={pratham}
              alt='Prathamesh Profile Photo'
              className='w-full max-h-72 object-contain'
            />
          </figure>
          <div className='card-body'>
            <h2 className='card-title'>Prathamesh B</h2>
            <p>Passionate Computer Science Engineer,and Entrepreneur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDevs;
