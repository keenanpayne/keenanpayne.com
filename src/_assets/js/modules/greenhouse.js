/**
* @function greenhouse
*
* Get the careers from Greenhouse
* TODO: It might be worth using Eleventy data files to generate markup from this API
*       https://www.11ty.dev/docs/data-computed/
*/
export default () => {
 const element = document.querySelector('.greenhouse');
 const request = new Request('https://boards-api.greenhouse.io/v1/boards/neuralink/jobs?content=true');

 if (!element) return;

 fetch(request)
   .then(response => response.json())
   .then(response => {
     // Array -> Set -> Array | Sets by definition don't have duplicates
     const removeDuplicates = xs => Array.from(new Set(xs))

     // Get a unique and flat list of departments
     // Note that jobs can be listed with multiple departments according to the Greenhouse API
     const departments = removeDuplicates(response.jobs.map(job => job.departments.map(x => x.name)).flat())

     // Get a list of all the jobs for each department
     const jobsByDepartment = departments.map(department => ({
       name: department,
       jobs: response.jobs.filter(job => job.departments.map(x => x.name).includes(department))
     }))

     // Job listing template
     const jobHTMLBlock = job => `
       <a class="greenhouse-item" href="${ job.absolute_url }" target="_blank">
         <h3 class="greenhouse-item-headline">
           ${ job.title }
         </h3>
       </a>

       <p class="greenhouse-item-meta">
         ${ job.location.name.replace(', United States', '') /* Remove the country */ }
       </p>

       <p class="greenhouse-item-cta">
         <a class="button" href="${ job.absolute_url }">
           Apply
         </a>
       </p>
     `

     // Job department template
     const departmentHTMLBlock = department => `
       <div class="greenhouse-department">
         <h2 class="greenhouse-deparment-headline">
           ${department.name}
         </h2>

         ${department.jobs.reduce((listing, job) => listing + jobHTMLBlock(job), '')}
       </div>
     `

     // Insert all the departments in the page,
     // each department will have its list of jobs populated
     jobsByDepartment.forEach(department => {
       element.insertAdjacentHTML('beforeend', departmentHTMLBlock(department))
     })
   });
};
