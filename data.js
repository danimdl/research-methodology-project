// ═══════════════════════════════════════════════════════
//  TEXTS & QUESTIONS
// ═══════════════════════════════════════════════════════
const TEXTS = {
  A: {
    tag: "TECHNOLOGY & SOCIETY", title: "Robots in Education",
    body: `<p>If you think of the jobs robots could never do, you would probably put doctors and teachers at the top of the list. It's easy to imagine robot cleaners and factory workers, but some jobs need human connection and creativity. But are we underestimating what robots can do? In some cases, they already perform better than doctors at diagnosing illness. Also, some patients might feel more comfortable sharing personal information with a machine than a person. Could there be a place for robots in education after all?</p>
    <p>British education expert Anthony Seldon thinks so. And he even has a date for the robot takeover of the classroom: 2027. He predicts robots will do the main job of transferring information and teachers will be like assistants. Intelligent robots will read students' faces, movements and maybe even brain signals. Then they will adapt the information to each student. It's not a popular opinion and it's unlikely robots will ever have empathy and the ability to really connect with humans like another human can.</p>
    <p>One thing is certain, though. A robot teacher is better than no teacher at all. In some parts of the world, there aren't enough teachers and 9–16 per cent of children under the age of 14 don't go to school. That problem could be partly solved by robots because they can teach anywhere and won't get stressed, or tired, or move somewhere for an easier, higher-paid job.</p>
    <p>Those negative aspects of teaching are something everyone agrees on. Teachers all over the world are leaving because it is a difficult job and they feel overworked. Perhaps the question is not 'Will robots replace teachers?' but 'How can robots help teachers?' Office workers can use software to do things like organise and answer emails, arrange meetings and update calendars. Teachers waste a lot of time doing non-teaching work, including more than 11 hours a week marking homework. If robots could cut the time teachers spend marking homework and writing reports, teachers would have more time and energy for the parts of the job humans do best.</p>`
  },
  B: {
    tag: "SOCIETY & TECHNOLOGY", title: "Grandparents, Grandchildren and the Social Media Divide",
    body: `<p>Today's grandparents are joining their grandchildren on social media, but the different generations' online habits couldn't be more different. In the UK the over-55s are joining Facebook in increasing numbers, meaning that they will soon be the site's second biggest user group, with 3.5 million users aged 55–64 and 2.9 million over-65s.</p>
    <p>Sheila, aged 59, says, 'I joined to see what my grandchildren are doing, as my daughter posts videos and photos of them. It's a much better way to see what they're doing than waiting for letters and photos in the post. That's how we did it when I was a child, but I think I'm lucky I get to see so much more of their lives than my grandparents did.'</p>
    <p>Ironically, Sheila's grandchildren are less likely to use Facebook themselves. Children under 17 in the UK are leaving the site — only 2.2 million users are under 17 — but they're not going far from their smartphones. Chloe, aged 15, even sleeps with her phone. 'It's my alarm clock so I have to,' she says. 'I look at it before I go to sleep and as soon as I wake up.'</p>
    <p>Unlike her grandmother's generation, Chloe's age group is spending so much time on their phones at home that they are missing out on spending time with their friends in real life. Sheila, on the other hand, has made contact with old friends from school she hasn't heard from in forty years. 'We use Facebook to arrange to meet all over the country,' she says. 'It's changed my social life completely.'</p>
    <p>Teenagers might have their parents to thank for their smartphone and social media addiction as their parents were the early adopters of the smartphone. Peter, 38 and father of two teenagers, reports that he used to be on his phone or laptop constantly. 'I was always connected and I felt like I was always working,' he says. 'How could I tell my kids to get off their phones if I was always in front of a screen myself?' So, in the evenings and at weekends, he takes his SIM card out of his smartphone and puts it into an old-style mobile phone that can only make calls and send text messages. 'I'm not completely cut off from the world in case of emergencies, but the important thing is I'm setting a better example to my kids and spending more quality time with them.'</p>
    <p>Is it only a matter of time until the generation above and below Peter catches up with the new trend for a less digital life?</p>`
  }
};

const QUESTIONS = {
  A: [
    { id: 'A1', type: 'mcq', text: 'According to Anthony Seldon, when will robots take over classrooms?', options: ['2025', '2027', '2030', 'They already have'], correct: 1 },
    { id: 'A2', type: 'mcq', text: 'What is a problem that robot teachers could solve globally?', options: ['Lack of human connection', 'Too much homework', 'Lack of teachers in some parts of the world', 'High costs of school buildings'], correct: 2 }
  ],
  B: [
    { id: 'B1', type: 'mcq', text: 'Why did Sheila join Facebook?', options: ['To reconnect with colleagues', 'To follow news', 'To see photos and videos of her grandchildren', 'To promote her business'], correct: 2 },
    { id: 'B2', type: 'mcq', text: 'What does Peter do to limit his smartphone use in the evenings?', options: ['Turns off WiFi', 'Removes his SIM and uses a basic phone', 'Deletes apps', 'Puts his phone in another room'], correct: 1 }
  ]
};