Title: Alt text, captions and titles for images
Source: https://www.stylemanual.gov.au/content-types/images/alt-text-captions-and-titles-images

# Alt text, captions and titles for images

Alternative text explains information in images for screen reader users. Captions describe images to help users relate them to surrounding text. Titles identify images and number them in long-form content.

## Give all users access to the same information

When people use content with images, they get information from different elements.

Users combine information from:

- image captions and titles
- body text and the images themselves
- alt text.
These elements have different purposes.

- Titles help identify specific images (for example, ‘Figure 1’) – particularly if they are listed or referenced in other parts of the content. They are different from the HTML title attribute .
- Captions are brief descriptions related to the image (for example commentary, attributions or quotations).
- Alternative text (alt text) is a short description of the information an image conveys. It’s either available to the user as an HTML attribute or through a document’s accessibility tool. Alt text is not usually visible on the page.
An extended description is alternative text that explains a complex image. It is visible either on the same page or on a separate page. You might write an extended description for a chart or process, for example.

### Example

Users are at the centre of the content lifecycle. The cycle starts with intent. It then moves through 6 stages: discover needs; draft; test; approve; publish; maintain. The process is circular. The cycle shows continuous improvement through repetition. Stages can repeat before completing a full cycle.

Don’t:

- hide information in the alt text, as a user might not see it
- repeat information in the alt text that a user would read in the caption
- use the <longdesc> attribute for extended descriptions.

## Add alt text to all images

Include short alt text – less than about 100 characters – for all informative images. Decorative images should have null alt text (alt="").

Users need images to have alt text for different purposes.

- Screen readers read out alt text to tell a user what’s in it and why it’s there.
- Browsers and mobile devices display alt text to tell a user with a slow internet connection or limited data about an image that isn’t displayed.
- Search engines use alt text to index images to make it easier for a user to find information.

### Accessibility requirements

User need:

I can understand any information contained in an image.

Fundamentals:

- Add alternative text for all images. For help with writing good alt text: the W3C alt decision tree .
- Write alternative text that describes the information or function of the image. For help to describe images: t he W3C/WAI Web Accessibility Tutorials - Images .
Web Content Accessibility Guidelines success criterion: 1.1.1 Non-text content – level A .

## Include captions for all images that are not decorative

Add captions for all images, unless they are only decorative.

Use captions to acknowledge the creator or copyright holder of images in captions. Use your organisation’s referencing style .

Include the HTML <figcaption> element to associate the caption with the image.

### Example

<figure> <figcaption> Figure 3: Kangaroo numbers in Victoria from 1880 to 1980 </figcaption> <img src="kangaroo.svg" alt= "Line graph showing a doubling of kangaroo numbers from 1880 to 1980"> ... </figure>

For more instructions about using figure captions, visit Web Accessibility Tutorials – complex images .

### Copyright requirements

When referencing, you must attribute copyright material . This includes images and text.

Write the attribution as part of the caption or following the copyright material. Alt text is also licensed under copyright.

Read the government copyright rules in the Australian Government intellectual property manual .

## Write alt text and captions to support the image’s purpose

The detail you need to include in alt text, captions and titles depends on the reason you have included the image.

- Decorative images add visual interest but not information (for example, the background pattern on a website).
- Informative images convey simple concepts or information (for example, how to open a medication bottle).
- Functional images are part of interactions and don’t convey information (for example, Australian Government branding that links to a home page).

### Decorative images

Include an empty value, or null text, for alt text if the image is decorative. This is 2 double quotation marks with no space (alt=""). In documents, set images as ‘Decorative image’ or ‘Background image’. The empty value tells screen readers to ignore the image.

An image is decorative if you can remove it from the page without losing any meaning or information.

Include keywords in the surrounding text to support search engines. Don’t create alt text to add keywords.

### Informational images

Write alt text that conveys the same important information as the image.

Don’t write something in the alt text that a user can’t learn from seeing the image or reading the caption or title.

Add captions and titles that give context.

Don’t repeat the information provided by the image and alt text. This prevents users of screen readers from hearing the same information twice.

If the caption or nearby text already explains the informational image, you might use very brief alt text.

Examples of informative images that might have an empty value in the alt text include:

- a photograph with a caption that is a full description of the content and function of the photograph
- a snapshot of a software screen that the text describes
- an illustration of an idea that the text describes.
In these cases, the images give visual learners another way to access information in the text. You could remove the image without losing the meaning, but this might disadvantage users who need a visual explanation.

#### Example

### Logos

Write the full name of the organisation in the logo alt text.

For logos that are functional links to home pages, use the name of the site in the link instead of the alt text. You don’t need to add the name to the link if it is already in the text on the page.

### Icons

Write different alt text for decorative, informative or functional icons.

- Use empty alt text (alt="") to declare it as decorative.
- Describe the informational icon so the user can understand what it is.
- State the functional icon’s purpose so the user can understand the outcome.

#### Example

### Complex images

Complex images contain too much information to include in the alt text alone.

To make sure people can access the information include:

- alt text that contains a brief interpretation of the main idea from the image
- a caption that summarises the image
- an extended description with more details about the data in the image, usually referencing the title or caption of the image.
Link in-text references to the image title only if it helps the user.

Write the extended description on the same page or, if it is very long, link to it on a separate page. Do not use the <longdesc> attribute.

Use the extended description to help the user understand the information in the image. Put most of the interpretation of the image in the body text. If the image is a graph, you might link to a table of data.

Extended descriptions usually include:

- what is being measured (the axis labels) and the units of measurements
- the range of data – the maximum and minimum or first and last
- the average or other statistics
- a description of the trend in the data – increasing or decreasing
- comparisons between data sets, such as ‘more than’, ‘relative’ or ‘inverse’.
For examples of alt text, visit Benetech Initiative’s General image description guidelines . They also have examples of maps, diagrams, complex images and extended descriptions for graphs .

### Photographs and illustrations

Include alt text and captions for all informative photographs and illustrations. The information you provide depends on the content format.

#### Example

This image could have a different caption and alt text, depending on the content format.

An environmental committee report might include a list of species with a photo and links to management plans. This is a functional image that serves as a link.

- Caption for committee report: Hoary sunray ( Leucochysum albicans ) (caption is hyperlinked)
- Alt text for committee report: alt=""
An agency visitor centre might publish a guide to the Snowy Mountains.

- Caption for visitor guide: These beautiful flowers (Hoary sunray) decorate the Snowy Mountains in summer
- Alt text for visitor guide: alt="Photograph of flower growing in rocky ground"
An annual report might include a section about the plants of the Snowy Mountains. The caption describes the image, so the alt text is null.

- Caption for annual report: The Hoary sunray has paper-like white flowers and thrives in the harsh rocky ground on Mount Townsend 

[Extract truncated - full guidance at the source URL]